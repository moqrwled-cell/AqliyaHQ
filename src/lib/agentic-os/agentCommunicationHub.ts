// ============================================================================
// AQLIYA AGENTIC OS — INTER-AGENT COMMUNICATION HUB
// ============================================================================

import type { AgentCommunicationMessage, AgentRole, MessageType } from './types';

export class AgentCommunicationHub {
  private static messageStore: AgentCommunicationMessage[] = [];

  /**
   * إرسال رسالة تواصل بين وكيل وآخر أو للأسطول بأكمله
   */
  public static sendMessage(
    msg: Omit<AgentCommunicationMessage, 'id' | 'timestamp'>
  ): AgentCommunicationMessage {
    const fullMsg: AgentCommunicationMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    AgentCommunicationHub.messageStore.push(fullMsg);
    return fullMsg;
  }

  /**
   * جلب الرسائل الموجهة لوكيل محدد
   */
  public static getMessagesForAgent(
    recipient: AgentRole,
    taskId?: string
  ): AgentCommunicationMessage[] {
    return AgentCommunicationHub.messageStore.filter((m) => {
      const isTarget = m.recipient === recipient || m.recipient === 'all';
      if (!isTarget) return false;
      if (taskId && m.taskId && m.taskId !== taskId) return false;
      return true;
    });
  }

  /**
   * جلب كامل خيط المحادثة لمهمة معينة
   */
  public static getTaskThread(taskId: string): AgentCommunicationMessage[] {
    return AgentCommunicationHub.messageStore.filter((m) => m.taskId === taskId);
  }

  /**
   * جلب أحدث رسالة صادرة من وكيل بنوع محدد
   */
  public static getLatestMessage(
    sender: AgentRole,
    messageType?: MessageType
  ): AgentCommunicationMessage | null {
    const matched = AgentCommunicationHub.messageStore.filter((m) => {
      if (m.sender !== sender) return false;
      if (messageType && m.messageType !== messageType) return false;
      return true;
    });

    if (matched.length === 0) return null;
    return matched[matched.length - 1];
  }

  /**
   * تلخيص كافة مخرجات الوكلاء في مهمة معينة ليستخدمها Nexus في الصياغة الموحدة
   */
  public static getSummaryForSynthesis(taskId?: string): Record<AgentRole, string> {
    const summary: Record<string, string> = {};
    const messages = taskId 
      ? AgentCommunicationHub.getTaskThread(taskId)
      : AgentCommunicationHub.messageStore;

    messages.forEach((m) => {
      if (m.payload && m.payload.summary) {
        summary[m.sender] = m.payload.summary;
      }
    });

    return summary as Record<AgentRole, string>;
  }

  /**
   * تفريغ رسائل التواصل
   */
  public static clearAll(): void {
    AgentCommunicationHub.messageStore = [];
  }

  /**
   * إجمالي الرسائل المخزنة
   */
  public static getMessageCount(): number {
    return AgentCommunicationHub.messageStore.length;
  }
}
