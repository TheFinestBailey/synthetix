const ethers = require('ethers');
const { assert } = require('../../contracts/common');
const { toBytes32 } = require('../../../index');
const { ensureBalance } = require('../utils/balances');
const { toUnit } = require('../../utils')();

function itCanShort({ ctx }) {
	describe('shorting', () => {
		const sUSDAmount = ethers.utils.parseEther('100');

		const amountToDeposit = toUnit('1000');
		const borrowCurrency = 'sETH';
		const amountToBorrow = toUnit('0.01');

		let CollateralStateContract;
		const borrowCurrencyBytes = toBytes32(borrowCurrency);

		let user;
		let CollateralShort, SynthsUSD;

		before('target contracts and users', () => {
			({ CollateralShort, SynthsUSD } = ctx.contracts);

			user = ctx.users.someUser;
		});

		before('ensure the user has sUSD', async () => {
			await ensureBalance({ ctx, symbol: 'sUSD', user: user, balance: sUSDAmount });
		});

		describe('open and close a short', () => {
			let tx, loan, loanId;

			describe('opening a loan', () => {
				before('open the loan', async () => {
					await SynthsUSD.approve(CollateralShort.address, toUnit('10000'), { from: user });
					tx = await CollateralShort.open(amountToDeposit, amountToBorrow, borrowCurrencyBytes, {
						from: user,
					});

					const event = tx.receipt.logs.find(l => l.event === 'LoanCreated');
					loanId = event.args.id;

					loan = await CollateralStateContract.getLoan(user, loanId);
				});

				it('shows the open non zero loan amount', async () => {
					assert.bnEqual(loan.amount, toUnit('0.01'));
				});
			});

			describe('closing a loan', () => {
				before('close the loan', async () => {
					tx = await CollateralShort.close(loanId, {
						from: user,
					});

					loan = await CollateralStateContract.getLoan(user, loanId);
				});

				it('shows the loan amount is zero because it was closed', async () => {
					assert.bnEqual(loan.amount, '0');
				});
			});
		});
	});
}

module.exports = {
	itCanShort,
};
