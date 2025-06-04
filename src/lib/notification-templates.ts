import { Locale } from 'next-intl';

import { NotificationBody, NotificationType, NotificationTypeEnum } from '@/types/notification';

import { getBaseUrl } from './url';

type TemplateFunction = (data: NotificationBody['data']) => string;

type TranslationKey = 'assignment' | 'status' | 'comment' | 'system';

type Translations = {
  [key in TranslationKey]: {
    [locale in Locale]: string;
  };
};

const translations: Translations = {
  assignment: {
    en: '🔔 You’ve been assigned to request #{requestId}. Please review it as soon as possible. #{urlBase}',
    es: '🔔 Has sido asignado a la solicitud #{requestId}. Por favor revísala lo antes posible. #{urlBase}',
  },
  status: {
    en: '📄 The status of request #{requestId} has changed to: {status}. #{urlBase}',
    es: '📄 El estado de la solicitud #{requestId} ha cambiado a: {status}. #{urlBase}',
  },
  comment: {
    en: '💬 {commenter} left a comment on request #{requestId}: "{comment}. #{urlBase}',
    es: '💬 {commenter} dejó un comentario en la solicitud #{requestId}: "{comment}. #{urlBase}',
  },
  system: {
    en: '🔧 {message}',
    es: '🔧 {message}',
  },
};

function interpolateTemplate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = data[key];
    if (value === undefined) {
      throw new Error(`Missing required template variable: ${key}`);
    }
    return String(value);
  });
}

function getTemplate(type: NotificationType, locale: Locale): TemplateFunction {
  const defaultLocale: Locale = 'en';
  const template = translations[type as TranslationKey]?.[locale] || translations[type as TranslationKey]?.[defaultLocale];

  if (!template) {
    throw new Error(`No template found for notification type: ${type} and locale: ${locale}`);
  }
  const urlBase = getBaseUrl() + '${tenantId}/requests/75450984-b6bd-4138-b832-ffc4240d5002';

  return (data) => {
    switch (type) {
      case NotificationTypeEnum.ASSIGNMENT:
        if ('requestId' in data) {
          return interpolateTemplate(template, { requestId: data.requestId, urlBase });
        }
        throw new Error('Invalid assignment notification data');

      case NotificationTypeEnum.STATUS:
        if ('requestId' in data && 'status' in data) {
          return interpolateTemplate(template, {
            requestId: data.requestId,
            status: data.status,
            urlBase,
          });
        }
        throw new Error('Invalid status notification data');

      case NotificationTypeEnum.COMMENT:
        if ('requestId' in data && 'commenter' in data && 'comment' in data) {
          return interpolateTemplate(template, {
            requestId: data.requestId,
            commenter: data.commenter,
            comment: data.comment,
            urlBase,
          });
        }
        throw new Error('Invalid comment notification data');

      case NotificationTypeEnum.SYSTEM:
        if ('message' in data) {
          return interpolateTemplate(template, { message: data.message });
        }
        throw new Error('Invalid system notification data');

      default:
        throw new Error(`No template found for notification type: ${type}`);
    }
  };
}

export function getNotificationTemplate(type: NotificationType, data: NotificationBody['data'], locale: Locale = 'en'): string {
  const template = getTemplate(type, locale);
  return template(data);
}
