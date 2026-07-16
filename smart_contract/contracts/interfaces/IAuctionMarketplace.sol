// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AuctionStructs} from "../libraries/AuctionStructs.sol";

/// @title IAuctionMarketplace
/// @notice Interface chuẩn hóa các hàm mà backend (Ethers.js) sẽ gọi
interface IAuctionMarketplace {
    function createAuction(
        string calldata productId,
        uint256 startingPrice,
        uint256 minIncrement,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 auctionId);

    function bid(uint256 auctionId) external payable;

    function withdraw() external;

    function endAuction(uint256 auctionId) external;

    function cancelAuction(uint256 auctionId) external;

    function getHighestBid(uint256 auctionId) external view returns (uint256);

    function getWinner(uint256 auctionId) external view returns (address);

    function getAuction(uint256 auctionId)
        external
        view
        returns (AuctionStructs.Auction memory);

    function pendingReturnOf(address bidder) external view returns (uint256);
}
