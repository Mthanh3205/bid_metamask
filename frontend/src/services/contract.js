import { ethers } from 'ethers';

// Địa chỉ contract đã deploy trên Sepolia
export const MARKETPLACE_ADDRESS = '0xa5bF480710626b6526c74Ca0f6f0fA4790CB3396';

export const MARKETPLACE_ABI = [
  // View / Pure
  "function admin() view returns (address)",
  "function getAuction(uint256 auctionId) view returns (tuple(uint256 auctionId, address seller, string productId, uint256 startingPrice, uint256 minIncrement, uint256 startTime, uint256 endTime, address highestBidder, uint256 highestBid, uint8 status))",
  "function getHighestBid(uint256 auctionId) view returns (uint256)",
  "function getWinner(uint256 auctionId) view returns (address)",
  "function pendingReturnOf(address bidder) view returns (uint256)",

  // Write
  "function createAuction(string productId, uint256 startingPrice, uint256 minIncrement, uint256 startTime, uint256 endTime) returns (uint256 auctionId)",
  "function bid(uint256 auctionId) payable",
  "function withdraw()",
  "function endAuction(uint256 auctionId)",
  "function cancelAuction(uint256 auctionId)",

  // Events
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, string productId, uint256 startingPrice, uint256 minIncrement, uint256 startTime, uint256 endTime)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 timestamp)",
  "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount)",
  "event AuctionCancelled(uint256 indexed auctionId, address indexed seller)",
  "event AuctionExtended(uint256 indexed auctionId, uint256 newEndTime)",
  "event Withdrawn(address indexed bidder, uint256 amount)",
];

// Status enum
export const AUCTION_STATUS = {
  0: 'Upcoming',
  1: 'Active',
  2: 'Ended',
  3: 'Cancelled'
};

// Helper
export const getMarketplaceContract = (signerOrProvider) => {
  return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signerOrProvider);
};

// ⚠️ FIX: Dùng Contract instance thay vì ContractFactory
export const createAuctionOnChain = async (signer, { productId, startingPrice, minIncrement, startTime, endTime }) => {
  const contract = getMarketplaceContract(signer);
  
  const startTimeSec = Math.floor(new Date(startTime).getTime() / 1000);
  const endTimeSec = Math.floor(new Date(endTime).getTime() / 1000);
  const nowSec = Math.floor(Date.now() / 1000);
  const safeStartTime = Math.max(startTimeSec, nowSec + 60);

  console.log('Calling createAuction with:', { productId, startingPrice, minIncrement, safeStartTime, endTimeSec });

  const tx = await contract.createAuction(
    productId,
    ethers.parseEther(startingPrice.toString()),
    ethers.parseEther(minIncrement.toString()),
    safeStartTime,
    endTimeSec
  );
  
  const receipt = await tx.wait();
  console.log('Receipt logs:', receipt.logs);  

  // Parse event từ receipt
  let auctionId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === 'AuctionCreated') {
        auctionId = Number(parsed.args.auctionId);
        console.log('Found AuctionCreated event, auctionId:', auctionId);
        break;
      }
    } catch (e) {
      // Bỏ qua log không parse được
    }
  }

  if (auctionId === null) {
    throw new Error('Không tìm thấy event AuctionCreated trong receipt!');
  }

  return { txHash: receipt.hash, auctionId };
};

// Đặt giá
export const placeBid = async (signer, auctionId, amountEth) => {
  const contract = getMarketplaceContract(signer);
  const tx = await contract.bid(auctionId, {
    value: ethers.parseEther(amountEth.toString())
  });
  return await tx.wait();
};

// Rút tiền hoàn trả
export const withdrawFunds = async (signer) => {
  const contract = getMarketplaceContract(signer);
  const tx = await contract.withdraw();
  return await tx.wait();
};

// Kết thúc auction
export const endAuction = async (signer, auctionId) => {
  const contract = getMarketplaceContract(signer);
  const tx = await contract.endAuction(auctionId);
  return await tx.wait();
};

// Lấy thông tin auction
export const getAuctionInfo = async (provider, auctionId) => {
  const contract = getMarketplaceContract(provider);
  const auction = await contract.getAuction(auctionId);
  
  return {
    auctionId: Number(auction.auctionId),
    seller: auction.seller,
    productId: auction.productId,
    startingPrice: ethers.formatEther(auction.startingPrice),
    minIncrement: ethers.formatEther(auction.minIncrement),
    startTime: Number(auction.startTime) * 1000,
    endTime: Number(auction.endTime) * 1000,
    highestBidder: auction.highestBidder,
    highestBid: ethers.formatEther(auction.highestBid),
    status: AUCTION_STATUS[Number(auction.status)] || Number(auction.status)
  };
};

// Lấy số tiền đang chờ rút
export const getPendingReturn = async (provider, address) => {
  const contract = getMarketplaceContract(provider);
  const amount = await contract.pendingReturnOf(address);
  return ethers.formatEther(amount);
};

// Lắng nghe events
export const listenToMarketplaceEvents = (provider, callbacks) => {
  const contract = getMarketplaceContract(provider);
  
  contract.on('BidPlaced', (auctionId, bidder, amount, timestamp) => {
    callbacks.onBid?.({
      auctionId: Number(auctionId),
      bidder,
      amount: ethers.formatEther(amount),
      timestamp: Number(timestamp) * 1000
    });
  });

  contract.on('AuctionEnded', (auctionId, winner, amount) => {
    callbacks.onEnd?.({
      auctionId: Number(auctionId),
      winner,
      amount: ethers.formatEther(amount)
    });
  });

  contract.on('AuctionExtended', (auctionId, newEndTime) => {
    callbacks.onExtend?.({
      auctionId: Number(auctionId),
      newEndTime: Number(newEndTime) * 1000
    });
  });

  return () => contract.removeAllListeners();
};