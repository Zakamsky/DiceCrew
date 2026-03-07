export const WS_EVENTS = {
  // client -> server
  JOIN:    'join',
  LEAVE:   'leave',
  MESSAGE: 'message',
  ROLL:    'roll',

  // server -> client
  JOINED:       'joined',
  USER_JOINED:  'user_joined',
  USER_LEFT:    'user_left',
  ROOM_STATE:   'room_state',
  MESSAGE_OUT:  'message_out',
  ROLL_RESULT:  'roll_result',
  ERROR:        'error',
}

export const ROOM_STATUS = {
  ACTIVE:  'active',
  CLOSED:  'closed',
}

export const MAX_ROOM_MEMBERS = 20
export const MAX_MESSAGE_LENGTH = 500
export const ROOM_CODE_LENGTH = 6
