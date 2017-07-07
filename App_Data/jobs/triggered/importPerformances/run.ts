/**
 * 劇場インポート
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

async function main() {
    debug('connecting mongodb...');
    sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    // todo インポート期間調整
    const IMPORT_TERMS_IN_DAYS = 7;
    const theaterAdapter = sskts.adapter.theater(sskts.mongoose.connection);
    const filmAdapter = sskts.adapter.film(sskts.mongoose.connection);
    const screenAdapter = sskts.adapter.screen(sskts.mongoose.connection);
    const performanceAdapter = sskts.adapter.performance(sskts.mongoose.connection);

    const theaterIds = <string[]>await theaterAdapter.model.distinct('_id').exec();
    const promises = theaterIds.map(async (theaterId) => {
        try {
            debug('importing performances...');
            await sskts.service.master.importPerformances(
                theaterId,
                moment().format('YYYYMMDD'),
                moment().add(IMPORT_TERMS_IN_DAYS, 'days').format('YYYYMMDD')
            )(filmAdapter, screenAdapter, performanceAdapter);
            debug('performances imported.');
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);

    sskts.mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});