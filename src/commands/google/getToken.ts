import { MPTMessage } from "../../plugins/types";
import { vk } from "../../plugins/core";
import { google } from "../../plugins/google";
import models from "../../plugins/models";
import { gmailUser } from "../../plugins/google/gmail";
export = {
	regexp: /^(?:привязка)$/i,
	template: ["привязка"],
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
			await message.sendMessage(
				`для привязки аккаунта Google к боту, получите токен по ссылке: ${
					(
						await vk.api.utils.getShortLink({
							url: await google.getURLtoGetToken(),
						})
					).short_url
				} и отправьте его боту.`,
			);
			let token = await message.question(`Введите токен:`);
			await message.sendMessage(`проверяю токен...`);
			try {
				if (token.text) {
					let userData = await google.getUserDataByTempToken(token.text);
					let userGoogleAccount: any = await models.userGoogle.findOne({
						vk_id: message.senderId,
					});
					let gmailInstance = new gmailUser(userData);
					let userEmail = await gmailInstance.getEmailAddress();
					if (!userGoogleAccount) {
						userGoogleAccount = new models.userGoogle({
							vk_id: message.senderId,
							token: userData,
						});
					} else {
						userGoogleAccount.token = userData;
					}
					await message.sendMessage(
						`токен указан верно.\nE-mail: ${userEmail}`,
					);
					return;
					// await userGoogleAccount.save();
				} else {
					return await message.sendMessage(`неверно указан токен.`);
				}
			} catch (error) {
				return await message.sendMessage(`неверно указан токен.`);
			}
		}
	},
};
