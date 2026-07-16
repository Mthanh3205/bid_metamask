//chứa các event// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuctionEvents
/// @notice Event dùng chung, backend (Node.js/Ethers.js) sẽ lắng nghe các event này
/// để đồng bộ dữ liệu on-chain vào MongoDB (bảng Auctions, Bids, Transactions...).
library AuctionEvents {
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        string productId,
        uint256 startingPrice,
        uint256 minIncrement,
        uint256 startTime,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );

    event AuctionExtended(uint256 indexed auctionId, uint256 newEndTime);

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionCancelled(uint256 indexed auctionId, address indexed seller);

    event Withdrawn(address indexed bidder, uint256 amount);
}
