//chỉ chứa các enum và struct để dùng chung và không cần viết lại// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuctionStructs
/// @notice Struct & enum dùng chung cho hệ thống đấu giá
library AuctionStructs {
    enum AuctionStatus {
        Upcoming,   // Chưa tới startTime
        Active,     // Đang diễn ra
        Ended,      // Đã kết thúc (có/không có người thắng)
        Cancelled   // Người bán đã hủy (chỉ khi chưa có ai đặt giá)
    }

    struct Auction {
        uint256 auctionId;
        address seller;
        string productId;       // Tham chiếu tới Product bên off-chain (MongoDB _id)
        uint256 startingPrice;  // Giá khởi điểm (wei)
        uint256 minIncrement;   // Bước giá tối thiểu (wei)
        uint256 startTime;      // Unix timestamp bắt đầu
        uint256 endTime;        // Unix timestamp kết thúc
        address highestBidder;  // Người đang giữ giá cao nhất
        uint256 highestBid;     // Giá cao nhất hiện tại (wei)
        AuctionStatus status;
    }
}
