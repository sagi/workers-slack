import '@sagi.io/globalthis';

export const getChannelsList = SlackAPI => async (limit = 200) => {
  const channelsArr = [];
  const formData = {
    limit,
    exclude_members: 'true',
    exclude_archived: 'true',
  };

  while (true) {
    const {
      channels,
      response_metadata: responseMetadata,
    } = await SlackAPI.channels.list(formData);
    channels && channels.length > 0 && channels.map(ch => channelsArr.push(ch));

    const { next_cursor: nextCursor } = responseMetadata;
    if (nextCursor) {
      formData.cursor = nextCursor;
    } else {
      return channelsArr;
    }
  }
};

export const getGroupsList = SlackAPI => async (limit = 200) => {
  const groupsArr = [];
  const formData = {
    limit,
    exclude_members: 'true',
    exclude_archived: 'true',
  };

  while (true) {
    const {
      groups,
      response_metadata: responseMetadata,
    } = await SlackAPI.groups.list(formData);
    groups && groups.length > 0 && groups.map(ch => groupsArr.push(ch));

    const { next_cursor: nextCursor } = responseMetadata;
    if (nextCursor) {
      formData.cursor = nextCursor;
    } else {
      return groupsArr;
    }
  }
};

export const isNotArchivedOrPrivateChannels = ch =>
  !(ch.is_archived || ch.is_private);

export const isNotArchivedChannel = ch => !ch.is_archived;

export const getRelevantChannelData = ch => {
  const { id, name, is_archived, is_private = 'true' } = ch;
  return { id, name, is_archived, is_private };
};

export const getNonArchivedPublicChannelsList = SlackAPI => async () => {
  const channels = await getChannelsList(SlackAPI)();
  return channels.map(getRelevantChannelData).filter(isNotArchivedChannel);
};

export const getNonArchivedPrivateChannelsList = async botAccessToken => {
  const groups = await exports.getGroupsList(botAccessToken);
  return groups.map(getRelevantChannelData).filter(isNotArchivedChannel);
};

export const getNonArchivedChannelsList = async botAccessToken => {
  const [publicChannels, privateChannels] = await Promise.all([
    getNonArchivedPublicChannelsList(botAccessToken),
    getNonArchivedPrivateChannelsList(botAccessToken),
  ]);
  return publicChannels.concat(privateChannels);
};

export const getUsersList = async (botAccessToken, limit = 200) => {
  const usersArr = [];
  const formData = { token: botAccessToken, include_locale: 'false', limit };

  while (true) {
    const {
      members,
      response_metadata: responseMetadata,
    } = await exports.slackAPIRequest(USERS_LIST_URL, formData);
    members && members.length > 0 && members.map(u => usersArr.push(u));

    const { next_cursor: nextCursor } = responseMetadata;
    if (nextCursor) {
      formData.cursor = nextCursor;
    } else {
      return usersArr;
    }
  }
};

export const getRelevantUsersData = user => {
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

export const isNotBotOrApp = u =>
  !(u.is_bot || u.is_app_user || u.name === 'slackbot');

export const getNonBotUsersList = async botAccessToken => {
  const users = await exports.getUsersList(botAccessToken);
  return users.map(getRelevantUsersData).filter(isNotBotOrApp);
};

export const getOpenImChannel = async (userId, botAccessToken) => {
  const formData = { user: userId, token: botAccessToken };
  const { channel } = await exports.slackAPIRequest(OPEN_IM_URL, formData);
  return channel;
};

export const sendDirectTextMessage = async ({ userId, token, text }) => {
  const channel = await getOpenImChannel(userId, token);
  const channelId = channel.id;
  const formData = { token, channel: channelId, text };
  return postMessage(formData);
};

// apps.uninstall only works with Workspace Apps! i.e. won't work for us.
export const uninstallApp = async ({ token, client_id, client_secret }) =>
  await exports.slackAPIRequest(APPS_UNINSTALL, {
    token,
    client_id,
    client_secret,
  });

export const getTeamInfo = async botAccessToken => {
  const { team } = await exports.slackAPIRequest(TEAM_INFO_URL, {
    token: botAccessToken,
  });
  return team;
};

export const reactionsAdd = async ({ token, name, timestamp, channel }) =>
  await exports.slackAPIRequest(REACTIONS_ADD, {
    token,
    name,
    timestamp,
    channel,
  });

export const postEphemeral = async ({
  token,
  channel,
  user,
  text,
  attachments,
}) => {
  if (text && attachments) {
    return await exports.slackAPIRequest(POST_EPHEMERAL, {
      token,
      channel,
      user,
      text,
      attachments,
    });
  } else if (text) {
    return await exports.slackAPIRequest(POST_EPHEMERAL, {
      token,
      channel,
      user,
      text,
    });
  } else if (attachments) {
    return await exports.slackAPIRequest(POST_EPHEMERAL, {
      token,
      channel,
      user,
      attachments,
    });
  } else {
    console.error(
      `API - postEphemeral both text and attachments aren't defined.`
    );
  }
};

export function utils(SlackAPI) {
  const x = 'getChannelsList';
  console.log(globalThis);

  return {
    [x]: globalThis[x](SlackAPI),
    getGroupsList: getGroupsList(SlackAPI),
    getNonArchivedPublicChannelsList: getNonArchivedPublicChannelsList(
      SlackAPI
    ),
  };
}
