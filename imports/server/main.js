import { WebAppInternals } from 'meteor/webapp';

import '/imports/server/files.collection.js';
import '/imports/server/methods.js';
import '/imports/server/spiderable.js';

WebAppInternals.enableSubresourceIntegrity();
