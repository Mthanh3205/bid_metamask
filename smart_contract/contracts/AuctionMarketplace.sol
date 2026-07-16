//smart contract chính chứa các nghiệp vụ logic của hệ thống
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAuctionMarketplace} from "./interfaces/IAuctionMarketplace.sol";
import {AuctionStructs} from "./libraries/AuctionStructs.sol";
import {AuctionErrors} from "./libraries/AuctionErrors.sol";
import {AuctionEvents} from "./libraries/AuctionEvents.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title AuctionMarketplace
/// @notice Smart contract lõi cho hệ thống đấu giá trực tuyến tích hợp MetaMask.
/// Chỉ dữ liệu quyết định tính minh bạch (giá, thời gian, người thắng, thanh toán)
/// được lưu on-chain. Thông tin sản phẩm (tên, mô tả, hình ảnh...) lưu ở MongoDB
/// và liên kết qua `productId`.
contract AuctionMarketplace is IAuctionMarketplace, ReentrancyGuard {
    /// @dev Thời gian tự động gia hạn nếu có bid trong những phút cuối (chống snipe)
    uint256 public constant EXTENSION_WINDOW = 5 minutes;
    uint256 public constant EXTENSION_DURATION = 5 minutes;

    address public admin;
    uint256 private _auctionIdCounter;

    mapping(uint256 => AuctionStructs.Auction) private _auctions;
    /// @dev Tiền hoàn trả cho những người bị outbid, rút bằng withdraw() (pull pattern)
    mapping(address => uint256) private _pendingReturns;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert AuctionErrors.NotAdmin();
        _;
    }

    modifier auctionExists(uint256 auctionId) {
        if (_auctions[auctionId].seller == address(0)) {
            revert AuctionErrors.AuctionNotFound();
        }
        _;
    }

    constructor(address _admin) {
        if (_admin == address(0)) revert AuctionErrors.ZeroAddress();
        admin = _admin;
    }

    // ---------------------------------------------------------------------
    // Quản lý đấu giá
    // ---------------------------------------------------------------------

    /// @inheritdoc IAuctionMarketplace
    function createAuction(
        string calldata productId,
        uint256 startingPrice,
        uint256 minIncrement,
        uint256 startTime,
        uint256 endTime
    ) external override returns (uint256 auctionId) {
        if (startingPrice == 0) revert AuctionErrors.InvalidStartingPrice();
        if (minIncrement == 0) revert AuctionErrors.InvalidIncrement();
        if (startTime < block.timestamp || endTime <= startTime) {
            revert AuctionErrors.InvalidTimeRange();
        }

        auctionId = ++_auctionIdCounter;

        _auctions[auctionId] = AuctionStructs.Auction({
            auctionId: auctionId,
            seller: msg.sender,
            productId: productId,
            startingPrice: startingPrice,
            minIncrement: minIncrement,
            startTime: startTime,
            endTime: endTime,
            highestBidder: address(0),
            highestBid: 0,
            status: AuctionStructs.AuctionStatus.Upcoming
        });

        emit AuctionEvents.AuctionCreated(
            auctionId,
            msg.sender,
            productId,
            startingPrice,
            minIncrement,
            startTime,
            endTime
        );
    }

    /// @notice Người bán hủy phiên đấu giá khi CHƯA có ai đặt giá
    function cancelAuction(uint256 auctionId)
        external
        override
        auctionExists(auctionId)
    {
        AuctionStructs.Auction storage a = _auctions[auctionId];

        if (msg.sender != a.seller) revert AuctionErrors.NotSeller();
        if (
            a.status == AuctionStructs.AuctionStatus.Ended ||
            a.status == AuctionStructs.AuctionStatus.Cancelled
        ) revert AuctionErrors.CannotCancelFinalizedAuction();
        if (a.highestBidder != address(0)) {
            revert AuctionErrors.CannotCancelAfterBids();
        }

        a.status = AuctionStructs.AuctionStatus.Cancelled;
        emit AuctionEvents.AuctionCancelled(auctionId, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Đấu giá
    // ---------------------------------------------------------------------

    /// @inheritdoc IAuctionMarketplace
    function bid(uint256 auctionId)
        external
        payable
        override
        nonReentrant
        auctionExists(auctionId)
    {
        AuctionStructs.Auction storage a = _auctions[auctionId];

        if (msg.sender == a.seller) revert AuctionErrors.SellerCannotBid();
        if (block.timestamp < a.startTime) {
            revert AuctionErrors.AuctionNotStarted();
        }
        if (
            block.timestamp >= a.endTime ||
            a.status == AuctionStructs.AuctionStatus.Ended ||
            a.status == AuctionStructs.AuctionStatus.Cancelled
        ) revert AuctionErrors.AuctionNotActive();

        if (a.status == AuctionStructs.AuctionStatus.Upcoming) {
            a.status = AuctionStructs.AuctionStatus.Active;
        }

        uint256 minRequired = a.highestBid == 0
            ? a.startingPrice
            : a.highestBid + a.minIncrement;

        if (msg.value < minRequired) revert AuctionErrors.BidTooLow();

        // Hoàn tiền cho người giữ giá cao nhất trước đó (pull pattern, không push trực tiếp)
        if (a.highestBidder != address(0)) {
            _pendingReturns[a.highestBidder] += a.highestBid;
        }

        a.highestBidder = msg.sender;
        a.highestBid = msg.value;

        emit AuctionEvents.BidPlaced(auctionId, msg.sender, msg.value, block.timestamp);

        // Chống "snipe" phút chót: nếu đặt giá trong vòng 5 phút cuối, gia hạn thêm 5 phút
        if (a.endTime - block.timestamp < EXTENSION_WINDOW) {
            a.endTime = block.timestamp + EXTENSION_DURATION;
            emit AuctionEvents.AuctionExtended(auctionId, a.endTime);
        }
    }

    /// @inheritdoc IAuctionMarketplace
    function withdraw() external override nonReentrant {
        uint256 amount = _pendingReturns[msg.sender];
        if (amount == 0) revert AuctionErrors.NoFundsToWithdraw();

        _pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert AuctionErrors.WithdrawFailed();

        emit AuctionEvents.Withdrawn(msg.sender, amount);
    }

    /// @inheritdoc IAuctionMarketplace
    function endAuction(uint256 auctionId)
        external
        override
        nonReentrant
        auctionExists(auctionId)
    {
        AuctionStructs.Auction storage a = _auctions[auctionId];

        if (
            a.status == AuctionStructs.AuctionStatus.Ended ||
            a.status == AuctionStructs.AuctionStatus.Cancelled
        ) revert AuctionErrors.AuctionAlreadyFinalized();
        if (block.timestamp < a.endTime) {
            revert AuctionErrors.AuctionNotYetEnded();
        }

        a.status = AuctionStructs.AuctionStatus.Ended;

        if (a.highestBidder != address(0)) {
            (bool success, ) = payable(a.seller).call{value: a.highestBid}("");
            if (!success) revert AuctionErrors.TransferToSellerFailed();
        }

        emit AuctionEvents.AuctionEnded(auctionId, a.highestBidder, a.highestBid);
    }

    // ---------------------------------------------------------------------
    // View functions
    // ---------------------------------------------------------------------

    /// @inheritdoc IAuctionMarketplace
    function getHighestBid(uint256 auctionId)
        external
        view
        override
        auctionExists(auctionId)
        returns (uint256)
    {
        return _auctions[auctionId].highestBid;
    }

    /// @inheritdoc IAuctionMarketplace
    function getWinner(uint256 auctionId)
        external
        view
        override
        auctionExists(auctionId)
        returns (address)
    {
        return _auctions[auctionId].highestBidder;
    }

    /// @inheritdoc IAuctionMarketplace
    function getAuction(uint256 auctionId)
        external
        view
        override
        auctionExists(auctionId)
        returns (AuctionStructs.Auction memory)
    {
        return _auctions[auctionId];
    }

    /// @inheritdoc IAuctionMarketplace
    function pendingReturnOf(address bidder) external view override returns (uint256) {
        return _pendingReturns[bidder];
    }
}
