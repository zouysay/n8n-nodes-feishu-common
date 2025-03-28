import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';

export default {
	name: '获取当前应用AccessToken',
	value: 'auth:getAccessToken',
	options: [],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const credentials = await this.getCredentials('feishuCredentialsApi');

		return {
			accessToken: credentials.accessToken,
		};
	},
} as ResourceOperations;
