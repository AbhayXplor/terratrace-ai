// This will handle GEE initialization on the server side
import ee from '@google/earthengine';

export const initGEE = async () => {
    return new Promise((resolve, reject) => {
        const serviceAccount = process.env.GEE_SERVICE_ACCOUNT;
        const privateKey = process.env.GEE_PRIVATE_KEY;

        if (!serviceAccount || !privateKey) {
            return reject(new Error('GEE credentials missing'));
        }

        try {
            ee.data.authenticateViaPrivateKey(
                { client_email: serviceAccount, private_key: privateKey },
                () => {
                    ee.initialize(
                        null,
                        null,
                        () => resolve(true),
                        (err: any) => reject(err)
                    );
                },
                (err: any) => reject(err)
            );
        } catch (err) {
            reject(err);
        }
    });
};
