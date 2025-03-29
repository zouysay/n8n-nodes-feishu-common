import { IExecuteFunctions } from 'n8n-workflow';
import { IRequestOptions } from 'n8n-workflow/dist/Interfaces';

class RequestUtils {
	static async originRequest(
		this: IExecuteFunctions,
		options: IRequestOptions,
		clearAccessToken = false,
	) {
		const credentials = await this.getCredentials('feishuCredentialsApi');

		return this.helpers.requestWithAuthentication
			.call(this, 'feishuCredentialsApi', options, {
				// @ts-ignore
				credentialsDecrypted: {
					data: {
						...credentials,
						accessToken: clearAccessToken ? '' : credentials.accessToken,
					},
				},
			})
			.catch((err) => {
				if (err?.cause?.error) {
					throw new Error(
						`Request Error: ${err?.cause?.error.code}, ${err?.cause?.error.msg} \n ` +
							JSON.stringify(err?.cause?.error.error),
					);
				}
				throw err;
			});
	}

	static async request(this: IExecuteFunctions, options: IRequestOptions) {
		if (options.json === undefined) options.json = true;

		return RequestUtils.originRequest.call(this, options).then((data) => {
			const handleResponse = (data: any) => {
				if (data.code && data.code !== 0) {
					throw new Error(
						`Request Error: ${data.code}, ${data.msg} \n ` + JSON.stringify(data.error),
					);
				}
				return data;
			};

			// 处理一次accesstoken过期的情况
			if (data.code && data.code === 99991663) {
				return RequestUtils.originRequest.call(this, options, true).then((data) => {
					return handleResponse(data);
				});
			}

			return handleResponse(data);
		});
	}
}

export default RequestUtils;
