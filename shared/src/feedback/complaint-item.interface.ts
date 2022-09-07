import { ComplaintDegree } from "./complaint-degree.enum";

export interface ComplaintItem {

  /**
   * Degree of complaint.
   */
  degree: ComplaintDegree,

  /**
   * Timestamp formatted in ISO 8601 'YYYY-MM-DDTHH:mm:ss.sssZ' of UTC time.
   */
  time: string
}
