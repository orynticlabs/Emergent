export { ensureOryCMSWhatsAppSchema } from "./whatsapp.schema";

export {
  encryptOryCMSWhatsAppSecret,
  decryptOryCMSWhatsAppSecret,
} from "./whatsapp.crypto";

export {
  getOryCMSWhatsAppSettings,
  saveOryCMSWhatsAppSettings,
  updateOryCMSWhatsAppSettings,
  deleteOryCMSWhatsAppSettings,
  testOryCMSWhatsAppConnection,
} from "./whatsapp.repo";

export { OryCMSWhatsAppService } from "./whatsapp.service";
export type { OryCMSWhatsAppWebhookVerificationConfig } from "./whatsapp.service";

export { ORYCMS_WHATSAPP_MODULE } from "./whatsapp.module";
export type { OryCMSModuleDescriptor } from "@/core";

export {
  ORYCMS_WHATSAPP_PROVIDERS,
  isOryCMSWhatsAppProvider,
} from "./whatsapp.types";
export type {
  OryCMSWhatsAppProvider,
  OryCMSWhatsAppSettingsRecord,
  OryCMSWhatsAppSettingsSafe,
  OryCMSSaveWhatsAppSettingsInput,
  OryCMSUpdateWhatsAppSettingsInput,
  OryCMSWhatsAppSettingsWriteRecord,
  OryCMSWhatsAppSettingsPatch,
  OryCMSWhatsAppTestConnectionResult,
} from "./whatsapp.types";

export { normalizeOryCMSWhatsAppWebhookPayload } from "./whatsapp.inbound";
export type {
  OryCMSWhatsAppInboundMessage,
  OryCMSWhatsAppInboundMessageType,
  OryCMSWhatsAppWebhookParseResult,
} from "./whatsapp.inbound.types";

export {
  timingSafeStringEqual,
  verifyOryCMSMetaWebhookSignature,
} from "./whatsapp.webhook-security";

export { sendOryCMSWhatsAppTextMessage } from "./whatsapp.outbound";
export type { OryCMSWhatsAppOutboundProvider } from "./whatsapp.outbound.provider";
export type {
  OryCMSWhatsAppSendTextRequest,
  OryCMSWhatsAppSendResult,
  OryCMSWhatsAppOutboundCredentials,
} from "./whatsapp.outbound.types";

export { ensureOryCMSWhatsAppAutomationSchema } from "./whatsapp.automation.schema";
export {
  claimOryCMSWhatsAppMessage,
  markOryCMSWhatsAppMessageStatus,
} from "./whatsapp.automation.repo";
export { OryCMSWhatsAppAIAutomationService } from "./whatsapp.ai-automation.service";
export type {
  OryCMSWhatsAppAutomationResult,
  OryCMSWhatsAppAutomationStatus,
} from "./whatsapp.ai-automation.service";

export { ensureOryCMSWhatsAppMenuSchema } from "./whatsapp.menu.schema";
export {
  getOryCMSWhatsAppMenuSettings,
  saveOryCMSWhatsAppMenuSettings,
  listOryCMSWhatsAppMenuOptions,
  replaceOryCMSWhatsAppMenuOptions,
} from "./whatsapp.menu.repo";
export { OryCMSWhatsAppMenuService } from "./whatsapp.menu.service";
export {
  ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MIN,
  ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MAX,
  ORYCMS_WHATSAPP_MENU_MAX_OPTIONS,
  ORYCMS_WHATSAPP_MENU_TITLE_MAX_LENGTH,
  ORYCMS_WHATSAPP_MENU_AI_INSTRUCTIONS_MAX_LENGTH,
  ORYCMS_WHATSAPP_MENU_WELCOME_MESSAGE_MAX_LENGTH,
} from "./whatsapp.menu.types";
export type {
  OryCMSWhatsAppMenuSettings,
  OryCMSWhatsAppMenuSettingsRecord,
  OryCMSWhatsAppMenuOptionRecord,
  OryCMSWhatsAppMenuOptionInput,
  OryCMSUpdateWhatsAppMenuInput,
} from "./whatsapp.menu.types";

export { ensureOryCMSWhatsAppMenuSessionSchema } from "./whatsapp.menu-session.schema";
export {
  isOryCMSWhatsAppCustomerAwaitingMenuSelection,
  setOryCMSWhatsAppCustomerAwaitingMenuSelection,
} from "./whatsapp.menu-session.repo";

export { ensureOryCMSWhatsAppMessagesSchema } from "./whatsapp.messages.schema";
export {
  recordOryCMSWhatsAppMessage,
  listOryCMSWhatsAppMessagesForCustomer,
  listOryCMSWhatsAppConversations,
} from "./whatsapp.messages.repo";
export { OryCMSWhatsAppInboxService } from "./whatsapp.messages.service";
export type {
  OryCMSWhatsAppMessageRecord,
  OryCMSRecordWhatsAppMessageInput,
  OryCMSWhatsAppMessageSender,
  OryCMSWhatsAppMessageDirection,
  OryCMSWhatsAppConversationSummary,
  OryCMSWhatsAppConversationDetail,
} from "./whatsapp.messages.types";

export { ensureOryCMSWhatsAppConversationModeSchema } from "./whatsapp.conversation-mode.schema";
export {
  getOryCMSWhatsAppConversationMode,
  setOryCMSWhatsAppConversationMode,
} from "./whatsapp.conversation-mode.repo";
export { isOryCMSWhatsAppConversationMode } from "./whatsapp.conversation-mode.types";
export type {
  OryCMSWhatsAppConversationMode,
  OryCMSWhatsAppConversationModeRecord,
} from "./whatsapp.conversation-mode.types";
