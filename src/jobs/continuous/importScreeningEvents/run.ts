/**
 * 上映イベントインポート
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions).then(debug).catch(console.error);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 0;
const INTERVAL_MILLISECONDS = 100;
const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await sskts.service.task.executeByName(
                sskts.factory.taskName.ImportScreeningEvents
            )({
                taskRepo: taskRepo,
                connection: sskts.mongoose.connection
            });
        } catch (error) {
            console.error(error);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
