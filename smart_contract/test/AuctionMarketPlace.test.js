const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('AuctionMarketplace', function () {
  const ONE_DAY = 24 * 60 * 60;

  async function deployFixture() {
    const [admin, seller, buyerA, buyerB, buyerC] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory('AuctionMarketplace');
    const marketplace = await Marketplace.deploy(admin.address);
    await marketplace.waitForDeployment();

    const now = await time.latest();
    const startTime = now + 60; // bắt đầu sau 1 phút
    const endTime = startTime + ONE_DAY; // kéo dài 1 ngày

    const startingPrice = ethers.parseEther('1');
    const minIncrement = ethers.parseEther('0.1');

    return {
      marketplace,
      admin,
      seller,
      buyerA,
      buyerB,
      buyerC,
      startTime,
      endTime,
      startingPrice,
      minIncrement,
    };
  }

  async function createdAuctionFixture() {
    const base = await deployFixture();
    const { marketplace, seller, startingPrice, minIncrement, startTime, endTime } = base;

    const tx = await marketplace
      .connect(seller)
      .createAuction('product-001', startingPrice, minIncrement, startTime, endTime);
    await tx.wait();

    return { ...base, auctionId: 1n };
  }

  describe('Triển khai (Deployment)', function () {
    it('gán đúng admin', async function () {
      const { marketplace, admin } = await loadFixture(deployFixture);
      expect(await marketplace.admin()).to.equal(admin.address);
    });

    it('revert nếu admin là address(0)', async function () {
      const Marketplace = await ethers.getContractFactory('AuctionMarketplace');
      await expect(Marketplace.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        Marketplace,
        'ZeroAddress'
      );
    });
  });

  describe('createAuction', function () {
    it('tạo phiên đấu giá thành công và emit event AuctionCreated', async function () {
      const { marketplace, seller, startingPrice, minIncrement, startTime, endTime } =
        await loadFixture(deployFixture);

      await expect(
        marketplace
          .connect(seller)
          .createAuction('product-001', startingPrice, minIncrement, startTime, endTime)
      )
        .to.emit(marketplace, 'AuctionCreated')
        .withArgs(
          1n,
          seller.address,
          'product-001',
          startingPrice,
          minIncrement,
          startTime,
          endTime
        );

      const auction = await marketplace.getAuction(1n);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.status).to.equal(0); // Upcoming
    });

    it('revert nếu startingPrice = 0', async function () {
      const { marketplace, seller, minIncrement, startTime, endTime } = await loadFixture(
        deployFixture
      );
      await expect(
        marketplace.connect(seller).createAuction('p1', 0, minIncrement, startTime, endTime)
      ).to.be.revertedWithCustomError(marketplace, 'InvalidStartingPrice');
    });

    it('revert nếu endTime <= startTime', async function () {
      const { marketplace, seller, startingPrice, minIncrement, startTime } = await loadFixture(
        deployFixture
      );
      await expect(
        marketplace
          .connect(seller)
          .createAuction('p1', startingPrice, minIncrement, startTime, startTime)
      ).to.be.revertedWithCustomError(marketplace, 'InvalidTimeRange');
    });
  });

  describe('bid', function () {
    it('cho phép đặt giá hợp lệ và cập nhật highestBid/highestBidder', async function () {
      const { marketplace, buyerA, startingPrice, startTime, auctionId } = await loadFixture(
        createdAuctionFixture
      );

      await time.increaseTo(startTime + 10);

      await expect(marketplace.connect(buyerA).bid(auctionId, { value: startingPrice }))
        .to.emit(marketplace, 'BidPlaced')
        .withArgs(auctionId, buyerA.address, startingPrice, anyValue);

      expect(await marketplace.getHighestBid(auctionId)).to.equal(startingPrice);
      expect(await marketplace.getWinner(auctionId)).to.equal(buyerA.address);
    });

    it('revert nếu bid trước startTime', async function () {
      const { marketplace, buyerA, startingPrice, auctionId } = await loadFixture(
        createdAuctionFixture
      );
      await expect(
        marketplace.connect(buyerA).bid(auctionId, { value: startingPrice })
      ).to.be.revertedWithCustomError(marketplace, 'AuctionNotStarted');
    });

    it('revert nếu người bán tự đặt giá', async function () {
      const { marketplace, seller, startingPrice, startTime, auctionId } = await loadFixture(
        createdAuctionFixture
      );
      await time.increaseTo(startTime + 10);
      await expect(
        marketplace.connect(seller).bid(auctionId, { value: startingPrice })
      ).to.be.revertedWithCustomError(marketplace, 'SellerCannotBid');
    });

    it('revert nếu giá đặt thấp hơn mức yêu cầu', async function () {
      const { marketplace, buyerA, startingPrice, startTime, auctionId } = await loadFixture(
        createdAuctionFixture
      );
      await time.increaseTo(startTime + 10);
      const tooLow = startingPrice - 1n;
      await expect(
        marketplace.connect(buyerA).bid(auctionId, { value: tooLow })
      ).to.be.revertedWithCustomError(marketplace, 'BidTooLow');
    });

    it('bid thứ 2 phải >= highestBid + minIncrement, người bị outbid được ghi nhận pendingReturn', async function () {
      const { marketplace, buyerA, buyerB, startingPrice, minIncrement, startTime, auctionId } =
        await loadFixture(createdAuctionFixture);

      await time.increaseTo(startTime + 10);
      await marketplace.connect(buyerA).bid(auctionId, { value: startingPrice });

      const notEnough = startingPrice + minIncrement - 1n;
      await expect(
        marketplace.connect(buyerB).bid(auctionId, { value: notEnough })
      ).to.be.revertedWithCustomError(marketplace, 'BidTooLow');

      const validBid = startingPrice + minIncrement;
      await marketplace.connect(buyerB).bid(auctionId, { value: validBid });

      expect(await marketplace.getHighestBid(auctionId)).to.equal(validBid);
      expect(await marketplace.getWinner(auctionId)).to.equal(buyerB.address);
      expect(await marketplace.pendingReturnOf(buyerA.address)).to.equal(startingPrice);
    });

    it('tự động gia hạn thời gian nếu bid trong 5 phút cuối (chống snipe)', async function () {
      const { marketplace, buyerA, startingPrice, startTime, endTime, auctionId } =
        await loadFixture(createdAuctionFixture);

      await time.increaseTo(endTime - 60); // còn 1 phút thì kết thúc

      const tx = await marketplace.connect(buyerA).bid(auctionId, { value: startingPrice });
      await expect(tx).to.emit(marketplace, 'AuctionExtended');

      const auction = await marketplace.getAuction(auctionId);
      expect(auction.endTime).to.be.gt(endTime);
    });

    it('revert nếu bid sau khi đã kết thúc', async function () {
      const { marketplace, buyerA, startingPrice, endTime, auctionId } = await loadFixture(
        createdAuctionFixture
      );
      await time.increaseTo(endTime + 1);
      await expect(
        marketplace.connect(buyerA).bid(auctionId, { value: startingPrice })
      ).to.be.revertedWithCustomError(marketplace, 'AuctionNotActive');
    });
  });

  describe('withdraw', function () {
    it('người bị outbid rút được tiền hoàn trả', async function () {
      const { marketplace, buyerA, buyerB, startingPrice, minIncrement, startTime, auctionId } =
        await loadFixture(createdAuctionFixture);

      await time.increaseTo(startTime + 10);
      await marketplace.connect(buyerA).bid(auctionId, { value: startingPrice });
      await marketplace.connect(buyerB).bid(auctionId, { value: startingPrice + minIncrement });

      await expect(marketplace.connect(buyerA).withdraw())
        .to.emit(marketplace, 'Withdrawn')
        .withArgs(buyerA.address, startingPrice);

      expect(await marketplace.pendingReturnOf(buyerA.address)).to.equal(0n);
    });

    it('revert nếu không có tiền để rút', async function () {
      const { marketplace, buyerA } = await loadFixture(createdAuctionFixture);
      await expect(marketplace.connect(buyerA).withdraw()).to.be.revertedWithCustomError(
        marketplace,
        'NoFundsToWithdraw'
      );
    });
  });

  describe('endAuction', function () {
    it('revert nếu kết thúc trước endTime', async function () {
      const { marketplace, auctionId } = await loadFixture(createdAuctionFixture);
      await expect(marketplace.endAuction(auctionId)).to.be.revertedWithCustomError(
        marketplace,
        'AuctionNotYetEnded'
      );
    });

    it('chuyển tiền cho seller và xác định đúng người thắng', async function () {
      const { marketplace, seller, buyerA, startingPrice, startTime, endTime, auctionId } =
        await loadFixture(createdAuctionFixture);

      await time.increaseTo(startTime + 10);
      await marketplace.connect(buyerA).bid(auctionId, { value: startingPrice });

      await time.increaseTo(endTime + 1);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(marketplace.endAuction(auctionId))
        .to.emit(marketplace, 'AuctionEnded')
        .withArgs(auctionId, buyerA.address, startingPrice);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(startingPrice);

      const auction = await marketplace.getAuction(auctionId);
      expect(auction.status).to.equal(2); // Ended
    });

    it('không có ai đặt giá thì seller không nhận được tiền, auction vẫn Ended', async function () {
      const { marketplace, endTime, auctionId } = await loadFixture(createdAuctionFixture);
      await time.increaseTo(endTime + 1);

      await expect(marketplace.endAuction(auctionId))
        .to.emit(marketplace, 'AuctionEnded')
        .withArgs(auctionId, ethers.ZeroAddress, 0n);
    });

    it('revert nếu gọi endAuction hai lần', async function () {
      const { marketplace, endTime, auctionId } = await loadFixture(createdAuctionFixture);
      await time.increaseTo(endTime + 1);
      await marketplace.endAuction(auctionId);
      await expect(marketplace.endAuction(auctionId)).to.be.revertedWithCustomError(
        marketplace,
        'AuctionAlreadyFinalized'
      );
    });
  });

  describe('cancelAuction', function () {
    it('seller hủy thành công khi chưa có ai đặt giá', async function () {
      const { marketplace, seller, auctionId } = await loadFixture(createdAuctionFixture);
      await expect(marketplace.connect(seller).cancelAuction(auctionId))
        .to.emit(marketplace, 'AuctionCancelled')
        .withArgs(auctionId, seller.address);
    });

    it('revert nếu không phải seller gọi cancelAuction', async function () {
      const { marketplace, buyerA, auctionId } = await loadFixture(createdAuctionFixture);
      await expect(
        marketplace.connect(buyerA).cancelAuction(auctionId)
      ).to.be.revertedWithCustomError(marketplace, 'NotSeller');
    });

    it('revert nếu đã có người đặt giá', async function () {
      const { marketplace, seller, buyerA, startingPrice, startTime, auctionId } =
        await loadFixture(createdAuctionFixture);
      await time.increaseTo(startTime + 10);
      await marketplace.connect(buyerA).bid(auctionId, { value: startingPrice });

      await expect(
        marketplace.connect(seller).cancelAuction(auctionId)
      ).to.be.revertedWithCustomError(marketplace, 'CannotCancelAfterBids');
    });
  });
});
