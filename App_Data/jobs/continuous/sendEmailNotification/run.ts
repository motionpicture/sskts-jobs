/**
 * メール通知
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const taskAdapter = sskts.adapter.task(sskts.mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await sskts.service.task.executeByName(
                sskts.factory.taskName.SendEmailNotification
            )(taskAdapter, sskts.mongoose.connection);
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);