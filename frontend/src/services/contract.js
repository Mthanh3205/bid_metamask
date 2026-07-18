import { ethers } from 'ethers';

export const AUCTION_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AuctionAlreadyFinalized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AuctionNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AuctionNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AuctionNotStarted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AuctionNotYetEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BidTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CannotCancelAfterBids",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CannotCancelFinalizedAuction",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidIncrement",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidStartingPrice",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTimeRange",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoFundsToWithdraw",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotSeller",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SellerCannotBid",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferToSellerFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WithdrawFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddress",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        }
      ],
      "name": "AuctionCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "productId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startingPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minIncrement",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "AuctionCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "winningBid",
          "type": "uint256"
        }
      ],
      "name": "AuctionEnded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEndTime",
          "type": "uint256"
        }
      ],
      "name": "AuctionExtended",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "bidder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "BidPlaced",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "bidder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdrawn",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "EXTENSION_DURATION",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "EXTENSION_WINDOW",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "bid",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "cancelAuction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "productId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startingPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minIncrement",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "createAuction",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "endAuction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "getAuction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "auctionId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "productId",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "startingPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minIncrement",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "highestBidder",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "highestBid",
              "type": "uint256"
            },
            {
              "internalType": "enum AuctionStructs.AuctionStatus",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct AuctionStructs.Auction",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "getHighestBid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "auctionId",
          "type": "uint256"
        }
      ],
      "name": "getWinner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "bidder",
          "type": "address"
        }
      ],
      "name": "pendingReturnOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

export const getAuctionContract = (contractAddress, signerOrProvider) => {
  return new ethers.Contract(contractAddress, AUCTION_ABI, signerOrProvider);
};

export const placeBid = async (contractAddress, signer, amount) => {
  const contract = getAuctionContract(contractAddress, signer);
  const tx = await contract.placeBid({
    value: ethers.parseEther(amount.toString())
  });
  return await tx.wait();
};

export const withdrawBid = async (contractAddress, signer) => {
  const contract = getAuctionContract(contractAddress, signer);
  const tx = await contract.withdraw();
  return await tx.wait();
};

export const endAuction = async (contractAddress, signer) => {
  const contract = getAuctionContract(contractAddress, signer);
  const tx = await contract.endAuction();
  return await tx.wait();
};

export const getAuctionInfo = async (contractAddress, provider) => {
  const contract = getAuctionContract(contractAddress, provider);
  const [highestBid, highestBidder, ended, endTime, minIncrement, startPrice, seller] = 
    await Promise.all([
      contract.highestBid(),
      contract.highestBidder(),
      contract.ended(),
      contract.endTime(),
      contract.minimumIncrement(),
      contract.startingPrice(),
      contract.seller()
    ]);
  
  return {
    highestBid: ethers.formatEther(highestBid),
    highestBidder,
    ended,
    endTime: Number(endTime) * 1000,
    minimumIncrement: ethers.formatEther(minIncrement),
    startingPrice: ethers.formatEther(startPrice),
    seller
  };
};

export const listenToEvents = (contractAddress, provider, callbacks) => {
  const contract = getAuctionContract(contractAddress, provider);
  
  contract.on('BidPlaced', (bidder, amount, event) => {
    callbacks.onBid?.({
      bidder,
      amount: ethers.formatEther(amount),
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber
    });
  });

  contract.on('AuctionEnded', (winner, amount) => {
    callbacks.onEnd?.({ winner, amount: ethers.formatEther(amount) });
  });

  return () => {
    contract.removeAllListeners();
  };
};