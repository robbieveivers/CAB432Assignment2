'use strict';
module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(/[&\/\\#,+\(\)$~%\.!^'"\;:*?\[\]<>{}@_]/g, '');
};
//Modified remove-punctuation node module to include @ symbols