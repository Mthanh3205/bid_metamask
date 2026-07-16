//chỉ chứa error
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuctionErrors
/// @notice Custom errors dùng chung, giúp tiết kiệm gas so với require(string)
library AuctionErrors {
    error ZeroAddress();
    error InvalidTimeRange();
    error InvalidStartingPrice();
    error InvalidIncrement();
    error AuctionNotFound();
    error NotSeller();
    error NotAdmin();
    error SellerCannotBid();
    error AuctionNotStarted();
    error AuctionNotActive();
    error AuctionAlreadyFinalized();
    error AuctionNotYetEnded();
    error BidTooLow();
    error NoFundsToWithdraw();
    error WithdrawFailed();
    error TransferToSellerFailed();
    error CannotCancelAfterBids();
    error CannotCancelFinalizedAuction();
}
