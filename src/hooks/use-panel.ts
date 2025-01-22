import { useQueryState } from 'nuqs';

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useQueryState('parentMessageId');
  const [profileUserId, setProfileUserId] = useQueryState('profileUserId');

  const onOpenProfile = (userId: string) => {
    setProfileUserId(userId);
    setParentMessageId(null);
  };

  const onOpenMessage = (messsageId: string) => {
    setParentMessageId(messsageId);
    setProfileUserId(null);
  };

  const onClose = () => {
    setParentMessageId(null);
    setProfileUserId(null);
  };
  return {
    parentMessageId,
    profileUserId,
    onOpenProfile,
    onOpenMessage,
    onClose,
  };
};
