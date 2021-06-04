const { bootstrapL1 } = require('../utils/bootstrap');
const { itCanShort } = require('../behaviors/short.behavior');

describe('Shorts integration tests (L1)', () => {
	const ctx = this;
	bootstrapL1({ ctx });

	itCanShort({ ctx });
});
