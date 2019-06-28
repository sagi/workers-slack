const isNotArchivedOrPrivateChannels = ch => !(ch.is_archived || ch.is_private);

const isNotArchivedChannel = ch => !ch.is_archived;

const getRelevantChannelData = ch => {
  const { id, name, is_archived, is_private = 'true' } = ch;
  return { id, name, is_archived, is_private };
};

const getNonArchivedPublicChannelsList = async botAccessToken => {
  const channels = await exports.getChannelsList(botAccessToken);
  return channels.map(getRelevantChannelData).filter(isNotArchivedChannel);
};

const getNonArchivedPrivateChannelsList = async botAccessToken => {
  const groups = await exports.getGroupsList(botAccessToken);
  return groups.map(getRelevantChannelData).filter(isNotArchivedChannel);
};

const getNonArchivedChannelsList = async botAccessToken => {
  const [publicChannels, privateChannels] = await Promise.all([
    getNonArchivedPublicChannelsList(botAccessToken),
    getNonArchivedPrivateChannelsList(botAccessToken),
  ]);
  return publicChannels.concat(privateChannels);
};

const getRelevantUsersData = user => {
  const {
    id,
    name,
    real_name,
    is_admin,
    is_owner,
    is_primary_owner,
    is_restricted,
    is_ultra_restricted,
    is_bot,
    is_app_user,
    updated,
    profile: { email },
  } = user;

  return {
    id,
    name,
    real_name,
    is_admin,
    is_owner,
    is_primary_owner,
    is_restricted,
    is_ultra_restricted,
    is_bot,
    is_app_user,
    updated,
    email,
  };
};

const isNotBotOrApp = u =>
  !(u.is_bot || u.is_app_user || u.name === 'slackbot');

const getNonBotUsersList = async botAccessToken => {
  const users = await exports.getUsersList(botAccessToken);
  return users.map(getRelevantUsersData).filter(isNotBotOrApp);
};

const sendDirectTextMessage = async ({ userId, token, text }) => {
  const channel = await getOpenImChannel(userId, token);
  const channelId = channel.id;
  const formData = { token, channel: channelId, text };
  return postMessage(formData);
};

const utils = {
  getNonArchivedPrivateChannelsList,
  getNonArchivedPublicChannelsList,
  isNotArchivedOrPrivateChannels,
  getNonArchivedChannelsList,
  getRelevantChannelData,
  sendDirectTextMessage,
  isNotArchivedChannel,
  getRelevantUsersData,
  getNonBotUsersList,
  isNotBotOrApp,
};
