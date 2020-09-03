const { fetchCounter } = require('./lib');
const { timingSafeEqual } = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY;
const compare = (a, b) => {
    try {
        return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
    } catch {
        return false;
    }
};

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(404).send('');
    }

    console.log("CALLED");

    const { nir, password, key } = req.body;

    if (!compare(key, SECRET_KEY)) {
        return res.status(403).send('')
    }

    try {
        const result = await fetchCounter(nir, password);

        if (result === false) {
            result = "INVALID";
        } else if (typeof result !== 'number' && result.error) {
            result = result.error;
        }
        res.send({ result });
    } catch (e) {
        console.log(e);
        console.error(e);
        res.status(500).send(e);
    }
};
