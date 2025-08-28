import get from 'lodash.get';
import { client, v2 } from '@datadog/datadog-api-client';

import { DATA_DOG_API_KEY, DATA_DOG_APP_KEY } from '../environment';

const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: DATA_DOG_API_KEY,
    appKeyAuth: DATA_DOG_APP_KEY,
  },
  maxRetries: 3,
});
configuration.unstableOperations['v2.queryScalarData'] = true;

const apiInstance = new v2.MetricsApi(configuration);

const getActive = async (
  from: Date, to: Date, isTrainer: boolean,
): Promise<number> => {
  const response = await apiInstance.queryScalarData({
    body: {
      data: {
        type: 'scalar_request',
        attributes: {
          formulas: [
            {
              formula: 'a',
            },
          ],
          queries: [
            {
              name: 'a',
              dataSource: 'logs',
              compute: {
                aggregation: 'cardinality',
                metric: '@user.account_id',
              },
              search: {
                query: `@endpoint:*/api/profile/v2/* service:api-prd @user.is_trainer:${isTrainer}`,
              },
              indexes: ['*'],
              groupBy: [],
            },
          ],
          from: from.getTime(),
          to: to.getTime(),
        },
      },
    },
  });

  return get(
    response,
    'data.attributes.columns[0].values[0]',
    0,
  );
};

export default getActive;
