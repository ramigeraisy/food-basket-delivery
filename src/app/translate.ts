import { Pipe, PipeTransform } from '@angular/core';
import { ValueListColumn, ColumnOptions, Context } from '@remult/core';
import { en } from './languages/en';
import { es } from './languages/es';
import { italy } from './languages/italy';
import { Sites } from './sites/sites';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
  transform(value: string): string {

    return translate(value);
  }
}


var terms: { [key: string]: string } = {};

export function translate(s: string) {
  let r = terms[s];

  if (!r) {
    r = translationConfig.forWho.translate(s);
    terms[s] = r;
  }
  return r;
}

export class TranslationOptions {


  static Families: TranslationOptions = new TranslationOptions(0, 'משפחות', {
    googleMapCountry:'IL'
  });
  static Donors: TranslationOptions = new TranslationOptions(1, 'תורמים', {
    googleMapCountry:'IL',
    translateFunction: s => s.replace(/משפחה אחת/g, "תורם אחד")
      .replace(/משפחות חוזרות/g, 'תורמים חוזרים')
      .replace(/משפחות מיוחדות/g, "תורמים מיוחדים")
      .replace(/מש' הכי קרובה/g, 'תורם הכי קרוב')
      .replace(/משפחה כלשהי/g, 'תורם כלשהו')
      .replace(/משפחות/g, "תורמים")
      .replace(/משפחה/g, 'תורם')
      .replace(/חדשה/g, 'חדש')
      .replace(/כפולות/g, 'כפולים')
  });
  static Soldiers: TranslationOptions = new TranslationOptions(2, 'חיילים', {
    googleMapCountry:'IL',
    translateFunction: s =>
      s.replace(/משפחה אחת/g, "חייל אחד")
        .replace(/משפחות חוזרות/g, 'חיילים חוזרים')
        .replace(/משפחות מיוחדות/g, "חיילים מיוחדים")
        .replace(/מש' הכי קרובה/g, 'חייל הכי קרוב')
        .replace(/משפחה כלשהי/g, 'חייל כלשהו')
        .replace(/משפחות/g, "חיילים")
        .replace(/משפחה/g, 'חייל')
        .replace(/חדשה/g, 'חדש')
        .replace(/כפולות/g, 'כפולים')
  });
  static southAfrica: TranslationOptions = new TranslationOptions(3, 'South Africa', {
    googleMapCountry:'ZA',
    leftToRight: true,
    languageCode: 'en',
    internationalPrefixForSmsAndAws:'+27'
  });
  static italy: TranslationOptions = new TranslationOptions(4, 'Italy', {
    googleMapCountry:'IT',
    leftToRight: true,
    languageCode: 'it',
    internationalPrefixForSmsAndAws:'+39'
  });
  static chile: TranslationOptions = new TranslationOptions(5, 'Chile', {
    googleMapCountry:'CL',
    leftToRight: true,
    languageCode: 'es'
  });
  TranslateOption() {

  }
  translate: (s: string) => string = s => s;
  constructor(public id: number, public caption: string, public args: {
    leftToRight?: boolean,
    languageCode?: string,
    googleMapCountry:string,
    translateFunction?: (s: string) => string,
    internationalPrefixForSmsAndAws?:string
  }) {
    if (args.translateFunction)
      this.translate = args.translateFunction;
  }

}
export class TranslationOptionsColumn extends ValueListColumn<TranslationOptions> {

  constructor(settingsOrCaption?: ColumnOptions<TranslationOptions>) {
    super(TranslationOptions, {
      dataControlSettings: () => ({
        valueList: this.getOptions(),
        width: '150'
      })
    }, settingsOrCaption);
    if (!this.defs.caption)
      this.defs.caption = 'המערכת היא עבור';
  }

}
export const translationConfig = { activateTranslation: false, forWho: TranslationOptions.Families };


const langForSite = new Map<string, Language>();
export function setLangForSite(site: string, lang: string) {
  langForSite.set(site, langByCode(lang));
}
export function getLang(context: Context) {
  let r = langForSite.get(Sites.getValidSchemaFromContext(context));
  if (r)
    return r;
  return use.language;
}




export class Language {
  assignDeliveryMenu = 'שיוך משלוחים למתנדב';
  defaultOrgName = 'שם הארגון שלי';
  defaultSmsText = 'שלום !מתנדב!\nלחלוקת חבילות !ארגון! לחץ על: !אתר! \nתודה !שולח!';
  reminderSmsText = 'שלום !מתנדב!, \nנשמח אם תעדכן את המערכת במצב המסירה של הסלים. לעדכון לחץ על:  !אתר!\nבתודה !ארגון!';
  commentForSuccessDelivery = 'נשמח אם תכתוב לנו הערה על מה שראית והיה';
  commentForSuccessLeft = 'אנא פרט היכן השארת את הסל ועם מי דיברת';
  commentForProblem = 'נשמח אם תכתוב לנו הערה על מה שראית והיה';
  messageForDoneDelivery = 'תודה על כל העזרה, נשמח אם תתנדבו שוב';
  deliveredButtonText = 'מסרתי את החבילה בהצלחה';
  boxes1Name = 'מנות';
  boxes2Name = 'משהו אחר';
  defaultDistributionListName = 'חלוקת מזון';
  AssignEscortComponent = 'שיוך מלווים';
  FamilyDeliveriesComponent = 'משלוחים';
  FamiliesComponent = 'משפחות';
  DeliveryFollowUpComponent = 'מעקב מתנדבים';
  NewsComponent = 'מצריך טיפול';
  DistributionMapComponent = "מפת הפצה";
  OverviewComponent = 'Overview';
  HelpersComponent = 'מתנדבים';
  DeliveryHistoryComponent = 'היסטורית משלוחים';
  PlaybackComponent = 'סרטון חלוקה';
  GeocodeComponent = 'GEOCODE';
  ImportFromExcelComponent = 'קליטת משפחות מאקסל';
  ImportHelpersFromExcelComponent = 'קליטת מתנדבים מאקסל';
  DuplicateFamiliesComponent = 'חיפוש משפחות כפולות';
  ManageComponent = 'הגדרות מערכת';
  MyFamiliesComponent = 'משפחות שלי';
  UpdateInfoComponent = 'הגדרות אישיות';
  LoginComponent = 'כניסה';
  RegisterComponent = 'הרשמה';
  copyright = ' חגי - אפליקציה לחלוקת סלי מזון';
  exit = 'יציאה';
  hello = "שלום";
  escoring = "מלווה את";
  clickForTutorialVideo = "לסרטון הדרכה קצר, לחצו כאן";
  cancelAllAssignments = 'בטל שיוך לכל המשלוחים';
  markAllDeliveriesAsSuccesfull = 'סמן נמסר בהצלחה לכל המשלוחים';
  estimatedTravelTime = 'סה"כ זמן נסיעה מוערך';
  minutes = 'דקות';
  km = 'ק"מ';
  leftDeliveryNextToHouse = 'השארתי ליד הבית';
  failedDeliveries = 'משלוחים שנתקלתי בבעיה';
  ranIntoAProblem = 'נתקלתי בבעיה';
  showAllDeliveries = 'הצג את כל המשלוחים לחלוקה';
  sendSmsWithLink = 'שלח הודעת SMS עם קישור';
  sendLinkOnWhatsapp = 'שלח קישור ב whatsapp';
  copyMessageWithLink = 'העתק הודעה עם קישור';
  copyLink = 'העתק קישור';
  sendSmsFromDevice = 'שלח קישור בSMS מהטלפון';
  reminderSent = 'תזכורת נשלחה';
  resendReminder = 'שלח שוב';
  sendReminderSms = 'שלחי SMS לתזכורת';
  callPerson = 'התקשר ל';
  callEscort = 'התקשר למלווה';
  family = 'משפחה';
  address = 'כתובת';
  phones = 'טלפונים';
  phone = 'טלפון';
  thereAre = 'יש';
  basket = 'סל';
  notice = 'שים לב!';
  floor = 'קומה';
  appartment = 'דירה';
  entrance = 'כניסה';
  updateComment = 'עדכן הערה';
  clickedByMistake = 'נלחץ בטעות - החזר למשלוחים לחלוקה';
  deliveriesDoneInTheLastTwoDays = 'משלוחים שחולקו ביומיים האחרונים';
  showAllCompletedDeliveries = 'הצג את כל המשלוחים שחולקו';
  showRouteOnGoogleMaps = 'הצג מסלול ב - google maps';
  selfPuckupSuccess = 'אספו את החבילה';
  packageWasPickedUp = 'אספו את החבילה';
  cancelAsignment = 'בטל שיוך';
  deliveryDetails = 'כרטיס משלוח';
  repeatFamilyNotice = 'הייתם אצל המשפחה הזו גם פעם קודמת';
  inacurateAddress = 'שימו לב, כתובת לא מדוייקת!';
  copyAddress = 'העתק כתובת';
  SelfPickupComponent = 'באים לקחת';
  oneDeliveryToDistribute = 'משלוח אחד לחלוקה';
  deliveriesToDistribute = 'משלוחים לחלוקה';
  volunteerInfo = 'פרטי מתנדב';
  assignRequiresADistributionList = 'לא ניתן לשייך מתנדבים מכיוון שלא נבחרה רשימת חלוקה. אנא בחרו רשימת חלוקה (למעלה מצד שמאל איפה שכתוב "כל הרשימות")';
  findHelperByName = 'חפש מתנדב לפי שם';
  clearHelperInfo = 'נקה פרטי מתנדב';
  saveHelperInfoAndMoveToNextHelper = 'שמור פרטי מתנדב ועבור למתנדב הבא';
  showHelperCompany = 'הצג חברה למתנדב';
  hideHelperCompany = 'הסתר חברה למתנדב';
  volunteerPhoneNumber = 'מספר הטלפון של המתנדב';
  assignHelpText = 'אנא הזיני את הטלפון של המתנדב ושמו, ואז תוכלי לבחור קבוצה, עיר ואילו סלים לשייך';
  asignVideoHelp = 'לסרטון הדרכה על שיוך משלוחים ויום האירוע לחצו כאן';
  asignDeliveriesTo = 'שיוך משלוחים ל';
  familyGroups = 'קבוצות שיוך משפחה';
  allGroups = 'כל הקבוצות';
  distributionCity = 'עיר לחלוקה';
  allCities = 'כל הערים';
  region = 'אזור';
  allRegions = 'כל האזורים';
  basketType = 'סוג סל';
  numOfFamilies = 'מספר משפחות';
  prioritizeRepeatFamilies = 'עדיפות למשפחות חוזרות';
  inProgress = 'עובד על זה...';
  noDeliveriesLeft = 'לא נותרו משלוחים מתאימים';
  asignClosestDelivery = "שייך משלוח הכי קרוב";
  asignAnyDelivery = 'שייך משלוח כלשהו';
  addAllRepeatFamilies = 'הוסף את כל המשפחות החוזרות';
  specialFamilies = 'משפחות מיוחדות';
  selectDeliveryByName = 'בחירת משפחה לפי שם';
  selectDeliveryOnMap = 'בחירת משפחה על המפה';
  selectDeliveryByStreet = 'בחירת משפחה לפי רחוב';
  transferDeliveriesFromOtherVolunteer = 'העבר משפחות ממתנדב אחר';
  replanRoute = 'חשב מסלול מחדש';
  isDefinedAsEscortOf = 'מוגדר כמלווה של';
  displayFamiliesOf = 'האם להציג את המשפחות של';
  allBaskets = 'כל הסלים';
  transfer = 'להעביר';
  deliveriesFrom = "משלוחים מ";
  toVolunteer = "למתנדב";
  atThisLocationThereAre = "בנקודה זו יש";
  deliveriesAssignAllOfThem = " משלוחים - לשייך את כולם?";
  thereAreAdditional = "ישנן עוד ";
  deliveriesAtSameAddress = "משלוחים באותה הכתובת, האם לשייך גם אותם?";
  noMatchingDelivery = "לא נמצאה משפחה מתאימה";
  deliveriesAssigned = "משלוחים שוייכו ";
  confirmPassword = 'אישור סיסמה';
  passwordDoesntMatchConfirmPassword = 'הסיסמה אינה תואמת את אישור הסיסמה';
  updateSaved = "העדכון נשמר, תודה";
  volunteerName = "שם";
  nameIsTooShort = 'השם קצר מידי';
  smsDate = 'מועד משלוח SMS';
  helperComment = 'הערה';
  needEscort = 'צריך מלווה';
  assignedDriver = 'נהג משוייך';
  escort = 'מלווה';
  alreadyExist = 'כבר קיים במערכת';
  password = 'סיסמה';
  createDate = 'מועד הוספה';
  remiderSmsDate = 'מועד משלוח תזכורת SMS';
  admin = 'מנהל כלל המערכת';
  responsibleForAssign = 'משייך מתנדבים לרשימת חלוקה';
  notAllowedToUpdateVolunteer = 'אינך רשאי לעדכן עבור מתנדב זה';
  company = "חברה";
  updateInfo = "עדכון פרטים";
  organizationName = 'שם הארגון';
  smsMessageContentCaption = 'תוכן הודעת SMS';
  smsReminderMessageContentCaption = 'תוכן הודעת תזכורת SMS';
  mustIncludeUrlKeyError = " חייב להכיל את המלל !אתר!, אחרת לא ישלח קישור";
  logoUrl = 'לוגו URL';
  deliveryCenterAddress = "כתובת מרכז השילוח";
  successMessageColumnName = 'הודעה למתנדב כאשר נמסר בהצלחה';
  leftByDoorMessageColumnName = 'הודעה למתנדב כאשר הושאר ליד הבית';
  problemCommentColumnName = 'הודעה למתנדב כאשר יש בעיה';
  messageForVolunteerWhenDoneCaption = 'הודעה למתנדב כאשר סיים את כל המשפחות';
  helpName = 'שם חלופי';
  helpPhone = 'טלפון חלופי';
  successButtonSettingName = "מלל כפתור נמסר בהצלחה";
  freeText1ForVolunteer = 'מלל חופשי 1 למתנדב';
  urlFreeText1 = 'כתובת אינטרנט ללחיצה על מלל חופשי 1 למתנדב';
  showText1OnlyWhenDone = 'להציג מלל חופשי 1 רק כאשר המתנדב סיים אל כל הסלים';
  freeText2ForVolunteer = 'מלל חופשי 2 למתנדב';
  urlFreeText2 = 'כתובת אינטרנט ללחיצה על מלל חופשי 2 למתנדב';
  showText2OnlyWhenDone = 'להציג מלל חופשי 2 רק כאשר המתנדב סיים אל כל הסלים';
  enableSelfPickupModule = 'ישנן משפחות שבאות לקחת ממרכז החלוקה';
  showVolunteerCompany = 'שמור מטעם איזה חברה הגיע המתנדב';
  activateEscort = 'הפעל ניהול מלווים לנהגים';
  showHelperComment = 'שמור הערה למתנדב';
  filterFamilyGroups = 'סינון קבוצת משפחה';
  filterCity = 'סינון עיר';
  filterRegion = 'סינון אזור';
  filterBasketType = 'סינון סוג סל';
  selectNumberOfFamilies = 'בחירת מספר משפחות';
  showLeftByHouseButton = 'הצג למתנדב כפתור השארתי ליד הבית';
  redTitleBar = "כותרת דף בצבע אדום";
  defaultPhonePrefixForExcelImport = "קידומת טלפון ברירת מחדל בקליטה מאקסל";
  checkIfFamilyExistsInDb = "בדוק אם משפחה כבר קיימת במאגר הנתונים";
  checkIfFamilyExistsInFile = "בדוק אם משפחה כבר קיימת בקובץ האקסל";
  excelImportAutoAddValues = "הוסף בלי לשאול ערכים לטבלאות התשתית";
  checkDuplicatePhones = "בדוק טלפונים כפולים";
  defaultStatusType = 'סטטוס משלוח ברירת מחדל למשפחות חדשות';
  boxes1NameCaption = "שם כמות 1 בסוגי סלים";
  boxes2NameCaption = "שם כמות 2 בסוגי סלים";
  assignerOrOrg = "הטלפון ממנו יצא הSMS";
  familyHelpPhone = "איש קשר לבירור כפי שמוגדר למשפחה";
  familySourcePhone = "טלפון גורם מפנה";
  otherPhone = "טלפון אחר";
  RemovedFromListExcelImportStrategy_displayAsError = 'הצג כשגיאה';
  RemovedFromListExcelImportStrategy_showInUpdate = 'הצג במשפחות לעדכון';
  RemovedFromListExcelImportStrategy_ignore = 'התעלם והוסף משפחה חדשה';
  existsInRemovedFromListStrategy = 'מה לעשות אם נמצאה משפחה תואמת המסומנת כהוצא מהרשימות';
  organizationInfo = 'פרטי הארגון';
  defaultHelpPhone = 'הטלפון ממנו יצא הSMS';
  defaulyHelpPhoneExplanation = 'כאשר נשלחת הודעת SMS למתנדב, היא מוצגת כאילו היא יצאה מהטלפון של מי ששייך לו את המשפחות ולחץ על הכפתור שלח SMS. ניתן להגדיר כאן שם חלופי וטלפון חלופי';
  smsTextHelpTitle = 'הודעה זו תשלח למתנדב ממסך שיוך משלוחים - עם הקישור למשפחות להן הוא מתבקש לחלק.';
  replacedByVolunteerName = 'יוחלף בשם המתנדב';
  replcaedBySenderName = 'יוחלף בשם השולח';
  replacedByOrgName = 'יוחלף בשם הארגון';
  deliveriesFor = 'משלוחים עבור';
  archiveCurrentDelivery = 'העבר משלוח נוכחי לארכיב?';

  familySelfPickup = 'יבואו לקחת את המשלוח ואינם צריכים משלוח?';
  newDeliveryFor = 'משלוח חדש ל';
  familyAlreadyHasAnActiveDelivery = "למשפחה זו כבר קיים משלוח מאותו סוג האם להוסיף עוד אחד?";
  notOk = 'לא תקין';
  deliveryCreatedSuccesfully = "משלוח נוצר בהצלחה";
  familyWasNotFound = "משפחה לא נמצאה";
  gpsLocationNear = 'נקודת GPS ליד';
  familyIdInHagaiApp = 'id של המשפחה באפליקצית חגי';
  familyName = "שם";
  socialSecurityNumber = 'מספר זהות';
  spouceSocialSecurityNumber = 'מספר זהות בן/בת הזוג';
  familyMembers = 'מספר נפשות';
  birthDate = 'תאריך לידה';
  nextBirthDay = 'יומולדת הבא';
  age = 'גיל';
  defaultBasketType = 'סוג סל ברירת מחדל';
  defaultQuantity = 'מספר סלים ברירת מחדל';
  familySource = 'גורם מפנה';
  familyHelpContact = 'איש קשר לבירור פרטים (עו"ס)';
  familyHelpPhone1 = 'עו"ס טלפון 1';
  familyHelpPhone2 = 'עו"ס טלפון 2';
  specialAsignment = 'שיוך מיוחד';
  defaultSelfPickup = 'באים לקחת ברירת מחדל';
  familyUniqueId = 'מזהה חד ערכי למשפחה';
  internalComment = 'הערה פנימית - לא תופיע למתנדב';
  cityAutomaticallyUpdatedByGoogle = "עיר (מתעדכן אוטומטית)";
  addressComment = 'הנחיות נוספות לכתובת';
  postalCode = 'מיקוד';
  commentForVolunteer = 'הערה שתופיע למתנדב';
  phone1 = "טלפון 1";
  phone1Description = 'הערות לטלפון 1';
  phone2 = "טלפון 2";
  phone2Description = 'הערות לטלפון 2';
  phone3 = "טלפון 3";
  phone3Description = 'הערות לטלפון 3';
  phone4 = "טלפון 4";
  phone4Description = 'הערות לטלפון 4';
  statusChangeDate = 'סטטוס: תאריך שינוי';
  statusChangeUser = 'סטטוס: מי עדכן';
  defaultVolunteer = "מתנדב ברירת מחדל";
  previousDeliveryStatus = 'סטטוס משלוח קודם';
  previousDeliveryDate = 'תאריך משלוח קודם';
  previousDeliveryNotes = 'הערת משלוח קודם';
  addressByGoogle = "כתובת כפי שגוגל הבין";
  addressOk = 'כתובת תקינה';
  previousDeliverySummary = 'סיכום משלוח קודם';
  createUser = 'משתמש מוסיף';
  lastUpdateDate = 'מועד עדכון אחרון';
  lastUpdateUser = 'משתמש מעדכן';
  within = 'תוך';
  forFamily = 'למשפחת';
  by = 'על ידי';
  theFamily = 'משפחת';
  wasUpdatedTo = 'עודכנה ל';
  wasAssignedTo = 'שוייכה ל';
  assignmentCanceledFor = 'בוטל השיוך למשפחת';
  invalidPhoneNumber = 'מספר טלפון אינו תקין';
  valueAlreadyExistsFor = 'ערך כבר קיים למשפחת';
  atAddress = 'בכתובת';
  familyGroup = 'קבוצות שיוך משפחה';
  identicalSocialSecurityNumber = 'מספר זהות זהה';
  sameAddress = 'כתובת זהה';
  identicalPhone = ' מספר טלפון זהה';
  similarName = " שם דומה";
  statusSummary = "סיכום סטטוס";
  onTheWay = "בדרך";
  unAsigned = "טרם שוייכו";
  specialUnasigned = 'מיוחדים שטרם שוייכו';
  delivered = "נמסר";
  problem = "בעייה";
  quantity = 'מספר סלים';
  volunteer = "מתנדב";
  commentsWritteByVolunteer = 'הערות שכתב המתנדב כשמסר';
  deliveryStatusDate = 'מתי';
  courierAsignUser = 'מי שייכה למתנדב';
  courierAsignDate = 'מועד שיוך למתנדב';
  deliveryCreateDate = 'מועד הקצאה';
  deliveryCreateUser = 'משתמש מקצה';
  requireFollowUp = 'צריך טיפול/מעקב';
  requireFollowUpUpdateUser = 'צריך טיפול - מי עדכן';
  requireFollowUpUpdateDate = 'צריך טיפול - מתי עודכן';
  deliveryDetailsFor = 'פרטי משלוח עבור';
  remainingByBaskets = 'נותרו לפי סלים';
  byBaskets = 'לפי סלים';
  deliveredByBaskets = 'נמסרו לפי סלים';
  remainingByCities = 'נותרו לפי ערים';
  remainingByGroups = 'נותרו לפי קבוצות';
  deliveries = 'משלוחים';
  empty = 'ריק';
  allOthers = 'כל השאר';
  total = 'סה"כ';
  deliverySummary = 'סיכום משלוח';
  families = 'משפחות';
  exportToExcel = 'יצוא לאקסל';
  newDelivery = 'משלוח חדש';
  cancelAssignmentFor = "האם לבטל שיוך מתנדב ל";
  familyDeliveries = 'משלוחים למשפחה';
  freezeDelivery = 'הקפא משלוח';
  freezeDeliveryHelp = `משלוח "קפוא" הינו הינו משלוח אשר לא ישוייך לאף מתנדב עד שאותו המשלוח "יופשר". הקפאה משמשת לעצירה זמנית של משלוחים מסויימים עד לשלב בו אפשר להפשיר אותם ולשלוח. האם להקפיא את המשלוח ל`;
  unFreezeDelivery = 'הפשר משלוח';
  deleteDelivery = 'מחק משלוח';
  shouldDeleteDeliveryFor = "האם למחוק את המשלוח ל";
  archiveDelivery = 'העבר לארכיון';
  shouldArchiveDelivery = "האם להעביר את המשלוח לארכיון?";
  deliveriesUpdated = 'משלוחים עודכנו';
  showAll = 'הצג הכל';
  searchFamily = 'חיפוש משפחה';
  newFamily = 'משפחה חדשה';
  googleApiProblem = 'מה הבעיה של גוגל';
  mergeFamilies = 'מיזוג משפחות';
  familyDetails = 'פרטי משפחה';
  googleSearchAddress = 'חפש כתובת בגוגל';
  familiesUpdated = 'משפחות עודכנו';
  byGroups = 'לפי קבוצות';
  adderssProblems = 'כתובות בעיתיות';
  activeFamilies = 'פעילות';
  allFamilies = 'כל המשפחות';
  lastName = 'שם משפחה';
  firstName = 'שם פרטי';
  streetName = 'רחוב';
  houseNumber = 'מספר בית';
  familyComponentVideos = 'לסרטוני הדרכה על מסך משפחות, לחצו כאן';
  close = 'סגור';
  questionsAndAnswers = 'שאלות ותשובות';
  dialTo = 'חייג ל';
  forHelp = 'לקבלת עזרה';
  dialForHelp = 'חייג לקבלת עזרה';
  cancel = 'בטל';
  updateDeliveryFailure = 'עדכן אי מסירה';
  all = 'כולם';
  searchVolunteer = 'חיפוש מתנדב';
  sendSmsToAllVolunteersThatDidntGetOne = 'שלח הודעת SMS למתנדבים שטרם קיבלו';
  completed = 'הושלמו';
  notDelivered = 'לא נמסרו';
  left = 'יצא';
  smsNotSent = 'טרם נשלח SMS';
  volunteers = 'מתנדבים';
  selectDeliveriesOnMap = 'בחר משפחות על המפה';
  drawingHelpText = 'אנא לחץ על המפה במספר נקודות כדי לסמן את האזור הרצוי, ולחץ לחיצה כפולה לסיום';
  selectedDeliveries = 'משלוחים סומנו';
  showVolunteers = 'הצג מתנדבים';
  addressesWithMoreThanOneFamily = 'כתובות עם יותר ממשפחה אחת';
  showFamilies = 'הצג משפחות';
  recentlyAssigned = 'שוייכו עכשיו';
  addVolunteer = 'הוסף מתנדב/מנהל';
  selectExcelFile = 'בחר קובץ אקסל';
  excelImportVideo = 'לסרטון הדרכה על קליטה מאקסל לחץ כאן';
  mapExcelColumns = 'הגדרת העמודות';
  loadExcelSettings = 'טען הגדרות';
  deleteExcelSettings = 'מחק הגדרות';
  nextStep = 'המשך לשלב הבא';
  addColumnsThatAreNotInTheFile = 'הוספת עמודות שלא מופיעות באקסל';
  excelColumnIgnore = 'לא לקלוט';
  remove = 'הסר';
  addExcelColumn = 'הוסף עמודה';
  columnSelectionInFile = 'בחירת עמודות בקובץ';
  excelSheet = 'גליון';
  linesInExcel = 'שורות באקסל';
  excelImportFinalSettings = 'הגדרות אחרונות';
  executeExcelImport = 'ביצוע הקליטה';
  excelImportResults = 'תוצאות';
  errors = 'שגיאות';
  excelCompareToThisFamilyAnd = 'השווה מול משפחה זו ו';
  moveToUpdateFamilies = 'העבר למשפחות עדכון';
  excelNoneOfTheseFamiliesMatch = ' אף אחת מהמשפחות הללו אינה מתאימה לשורה באקסל, ';
  moveToNewFamilies = 'העבר למשפחות חדשות';
  readExcelRow = 'קלוט את שורה';
  excelReadLineAnyhow = 'בכל זאת';
  previous = 'קודם';
  next = 'הבא';
  stopAskingForConfirmation = 'הפסק לשאול האם מסכים לפני כל דבר';
  familiesForUpdate = 'משפחות לעדכון';
  removeFromFamiliesToUpdate = 'הסר ממשפחות לעדכן';
  newFamilies = 'משפחות חדשות';
  addAllFamilies = 'הוסף את כל המשפחות';
  existingFamilies = 'משפחות קיימות';
  saveExcelImportReport = 'שמור דוח מצב קליטה מאקסל';
  saveExcelSettings = 'שמור הגדרות';
  newVolunteers = 'מתנדבים חדשים';
  addAllVolunteers = 'הוסף את כל המתנדבים';
  updateVolunteers = 'מתנדבים לעדכון';
  existingVolunteers = 'מתנדבים קיימים';
  moveToNewVolunteers = 'העבר למתנדבים להוספה';
  pleaseWaitVerifyingDetails = 'אנא המתן - מוודא פרטים';
  replaceBySiteUrl = 'יוחלף בכתובת האתר';
  sampleMessage = 'הודעה לדוגמא';
  reminderSmsTextHelp = 'הודעה זו תשלח למתנדב שמתעכב ממסך מעקב מתנדבים';
  sampleReminderSms = 'הודעת תזכורת לדוגמא';
  basketTypes = 'סוגי סלים';
  distributionLists = 'רשימות חלוקה';
  familySources = 'גורמים מפנים';
  distributionListsHelp = 'קבוצות אלו יוצגו בשיוך משפחות ויאפשרו סינון מהיר';
  volunteerTexts = 'הודעות למתנדב';
  volunteerQAndA = 'שאלות ותשובות למתנדב';
  volunteerQAndAHelp = 'כאשר המתנדב לוחץ על הכפתור "נתקלתי בבעיה" מופע לו מסך עם רשימה זו של שאלות ותשובות לעזרה';
  question = 'שאלה';
  answer = 'תשובה';
  voluntreeHelpPhones = 'טלפונים לעזרה למתנדב';
  volunteerHelpPhonesHelpLine1 = 'כאשר המתנדב לוחץ על הכפתור "נתקלתי בבעיה" מופע לו מסך אם אפשרות להתקשר לעזרה או לעדכן שלא מסר.';
  volunteerHelpPhonesHelpLine2 = 'כאן ניתן לעדכן אילו טלפונים יופיעו לו לעזרה, אפשר לעדכן אחד או יותר.';
  preferences = 'העדפות';
  logoAndIcons = 'לוגו וצלמיות';
  logoRecommendTool = 'אנו ממליצים ליצור את האייקונים בעזרת';
  logoRecommendAfter = 'ומהתוצאה שהוא יוצר להשתמש favicon.ico עבור האייקון - וב apple-icon-120x120.png עבור הלוגו';
  iconForWebSite = 'אייקון לאתר';
  logoForWebsiteAndPhone = 'לוגו לאתר ולטלפון';
  deleteFamilies = 'מחיקת נתונים';
  deleteFamiliesHelp = 'לחיצה על הכפתור תמחוק את כל המשפחות בסטטוס "למחיקה" מהמערכת. היסטורית המשלוחים שלהן תישמרנה.';
  deleteFamiliesButton = 'מחק את כל המשפחות בסטטוס "למחיקה"';
  mergeForFamily = 'מיזוג למשפחת';
  merge = 'שמור מיזוג';
  volunteerFeedbackVideo = 'לסרטון הדרכה על משוב המתנדבים לחץ כאן';
  updatedBy = 'עודכן על ידי';
  showAsignDeliveryFor = 'הצג שיוך משלוחים ל';
  moreNews = 'עוד חדשות';
  filter = 'סינון';
  deliveryDetailsAsDisplayedToVolunteer = 'פרטי המשפחה כפי שיופיעו למתנדב';
  assign = 'שייכי';
  familesOnStreet = 'משפחות ברחוב';
  moreFamilies = 'עוד משפחות';
  recentVolunteers = 'מתנדבים אחרונים';
  moreVolunteers = 'עוד מתנדבים';
  showAllFamilies = 'הצג את כל המשפחות';
  whatWentWrong = 'מה לא הסתדר?';
  addCurrentLocationToNote = 'הוסף מיקום נוכחי להערה';
  basketNotDelivered = 'הסל לא נמסר';
  confirm = 'אשר';
  displayFamilyAsVolunteerWillSeeIt = 'הצג משפחה כפי שתנדב יראה אותה';
  infoAboutUpdates = 'פרטי עדכונים';
  sendMessageToVolunteer = 'שלח הודעה למתנדב';
  deliveryInfo = 'פרטי משלוח';
  checkAddress = 'בדוק כתובת';
  showOnGovMap = 'הצג ב govmap';
  showOnGoogleMap = 'הצג בגוגל MAPS';
  openWaze = 'פתח WAZE';
  badAddressTitle = 'שים לב, כתובת לא מדוייקת';
  badAddressHelpStart = 'גוגל לא הצליח למצוא את הכתובת בצורה מדוייקת';
  badAddressHelpLine1 = 'יש להשוות בין השדה "כתובת" לשדה "כתובת כפי שגוגל הבין".'
  badAddressHelpLine2 = 'כתובת לא מדוייקת עלולה להוביל המתנדב למקום לא נכון בוייז.';
  familyAdditionalInfo = 'פרטים נוספים';
  deliveryDefaults = 'ברירות מחדל למשלוח';
  familiesWithSimilarInfo = 'משפחות עם פרטים דומים';
  save = 'שמור';
  rememberMeOnThisDevice = 'זכור אותי במכשיר זה';
  signIn = 'כניסה';
  pleaseRegister = 'אם אינך רשומה, אנא הרשמי כאן';
  register = 'הרשמה';
  isAlreadyAsignedTo = ' כבר משוייכת ל';
  onStatus = 'בסטטוס';
  shouldAssignTo = 'האם לשייך אותו למתנדב';
  saveVolunteerInfo = 'שמירת פרטי מתנדב:';
  adminRequireToSetPassword = ' אתה מוגדר כמנהל אך לא מוגדרת עבורך סיסמה. כדי להשתמש ביכולות הניהול חובה להגן על הפרטים עם סיסמה. הנך מועבר למסך עדכון פרטים לעדכון סיסמה.';
  userNotFoundOrWrongPassword = "משתמשת לא נמצאה או סיסמה שגויה";
  fromDate = 'מתאריך';
  toDate = 'עד תאריך';
  shouldSendSmsTo = 'האם לשלוח הודעת SMS ל';
  delayed = 'מתעכבים';
  doneVolunteers = 'סיימו';
  problems = 'בעיות';
  delveriesInProgress = 'משפחות מחכות';
  dates = 'תאריכים';
  selfPickup = 'באים לקחת';
  delveriesSuccesfull = 'נמסרו';
  familiesAt = 'משפחות ב';
  noFamiliesSelected = 'לא נבחרו משפחות';
  cantMergeOneFamily = 'אין מה למזג משפחה אחת';
  tooManyFamiliesForMerge = 'יותר מידי משפחות בבת אחת';
  basketTypeName = 'שם';
  readyForDelivery = 'מוכן למשלוח';
  frozen = 'מוקפא';
  deliveredSuccessfully = 'נמסר בהצלחה';
  leftByHouse = 'הושאר ליד הבית';
  notDeliveredBadAddress = 'לא נמסר, בעיה בכתובת';
  notDeliveredNotHome = 'לא נמסר, לא היו בבית';
  notDeliveredOther = 'לא נמסר, אחר';
  deliveryStatus = 'סטטוס משלוח';
  useFamilyDefaultBasketType = 'השתמש בסוג הסל המוגדר למשפחה';
  mustSelectDistributionList = 'חובה לבחור רשימת חלוקה';
  assignAFamilyGroup = 'שיוך לקבוצת משפחות';
  action = 'פעולה';
  freezeDeliveries = 'הקפא משלוחים';
  freezeDeliveriesHelp = `משלוח "קפוא" הינו הינו משלוח אשר לא ישוייך לאף מתנדב עד שאותו המשלוח "יופשר". הקפאה משמשת לעצירה זמנית של משלוחים מסויימים עד לשלב בו אפשר להפשיר אותם ולשלוח. ההקפאה תתבצע רק למשלוחים שהם מוכנים למשלוח. `;
  unfreezeDeliveries = 'ביטול הקפאת משלוחים';
  unfreezeDeliveriesHelp = 'ביטול ההקפאה יחזיר משלוחים קפואים למוכן למשלוח';
  archiveFinishedDeliveries = "העבר משלוחים שהסתיימו לארכיון";
  deletePendingDeliveries = "מחק משלוחים שטרם נמסרו למשפחות אלו";
  deleteExistingComment = "מחק הערה קודמת";
  updateStatusHelp = 'סטטוס הוצא מהרשימות - נועד כדי לסמן שהמשפחה לא אמורה לקבל מזון - אבל בניגוד לסטטוס למחיקה - אנחנו רוצים לשמור אותה בבסיס הנתונים כדי שאם הרווחה יביאו לנו אותה שוב, נדע להגיד שהם הוצאו מהרשימות. זה מתאים למשפחות שחס וחלילה נפתרו או שפשוט לא רוצים לקבל - או שהכתובת לא קיימת וכו...';
  updateFamilyStatus = 'עדכן סטטוס משפחה';
  updateDefaultBasket = 'עדכן סוג סל ברירת מחדל';

  updateExistingDeliveries = "שנה גם עבור משלוחים שטרם נמסרו";
  updateDefaultSelfPickup = 'עדכן באים לקחת ברירת מחדל';
  updateArea = 'עדכן אזור למשפחות';
  updateDefaultQuantity = 'עדכן כמות סלים ברירת מחדל';
  updateFamilySource = 'עדכן גורם מפנה ';
  selfPickupStrategy_familyDefault = "באים לקחת בהתאם להגדרת הברירת מחדל למשפחה";
  selfPickupStrategy_yes = "יבואו לקחת את המשלוח ואינם צריכים משלוח";
  selfpickupStrategy_no = "משלוח עד הבית";
  selfpickupStrategy_byCurrentDelivery = "באים לקחת בהתאם להגדרת המשלוח הנוכחי";
  selfPickupStrategy = 'הגדרת באים לקחת';
  notAthorized = "!פעולה לא מורשת";
  actionNotFound = "פעולה לא נמצאה בשרת";
  active = 'פעיל';
  removedFromList = 'הוצא מהרשימות';
  toDelete = 'למחיקה';
  familyStatus = 'סטטוס';
  deleteDeliveries = 'מחק משלוחים';
  deleteDeliveriesHelp = 'שים לב - מחיקת המשלוח לא תוציא את המשפחה מהרשימות - כדי להוציא את המשפחה מהרשימות יש לבצע עדכון לסטטוס המשפחה. המחיקה תתבצע רק עבור משלוחים שטרם נמסרו';
  updateCourierByCurrentCourier = 'עדכן את המתנדב מהמשלוח הנוכחי';
  updateDefaultVolunteer = 'עדכן מתנדב ברירת מחדל למשפחה';
  clearVolunteer = 'בטל שיוך למתנדב';
  setAsDefaultVolunteer = 'עדכן גם כמתנדב ברירת מחדל';
  updateVolunteerHelp = 'בכדי לעדכן מתנדב מ"בדרך" ל"מוכן למשלוח" יש לסמן את "בטל שיוך למתנדב". בכל מקרה עדכון מתנדב יעשה רק למשלוחים שאינם נמסרו';
  updateVolunteer = 'עדכן מתנדב למשלוחים';
  updateDeliveriesStatus = 'עדכן סטטוס למשלוחים';
  updateDeliveriesStatusHelp = `סטטוס "מוקפא" הינו הינו משלוח אשר לא ישוייך לאף מתנדב עד שאותו המשלוח "יופשר". הקפאה משמשת לעצירה זמנית של משלוחים מסויימים עד לשלב בו אפשר להפשיר אותם ולשלוח.             ההקפאה תתבצע רק למשלוחים שהם מוכנים למשלוח. `;
  statusNotSelected = "לא נבחר סטטוס";
  updateCanceled = "העדכון הופסק";
  youveSelectedToUpdateStatus = 'בחרת לעדכן סטטוס';
  youveProbablyMeantNewDelivery = " - אם את/ה מעוניין ליצור משלוח חדש, יש לעשות זאת בתפריט 'משלוח חדש'.";
  updateDeliveredStatusesTo = "עדכון משלוחים שהסתיימו לסטטוס";
  willNotSaveHistoryDoYouWantToStop = " לא ישמור בהיסטוריה את הסטטוס של המשלוחים שהסתיימו - האם להפסיק את העדכון?";
  archiveDeliveries = 'העברה לארכיב';
  archiveDeliveriesHelp = 'העברה לארכיב תעשה רק למשלוחים שנמסרו או נתקלו בבעיה. ניתן לראות את הארכיב בכל עת במסך היסטורית משלוחים';
  updateBasketType = 'עדכן סוג סל';
  updateBasketQuantity = 'עדכן כמות סלים';
  updateDistributionList = 'עדכן רשימת חלוקה';
  useBusketTypeFromCurrentDelivery = 'השתמש בסוג הסל המוגדר במשלוח הנוכחי';
  newDeliveryForAll = 'משלוח חדש לכל המשלוחים ולא רק לאלו שהסתיימו בהצלחה';
  distributionListAsCurrentDelivery = 'רשימת חלוקה כמו במשלוח הנוכחי';
  pleaseSelectDistributionList = 'חובה לבחור רשימת חלוקה';
  newDeliveryForDeliveriesHelp = 'משלוח חדש יוגדר עבור כל המשלוחים המסומנים שהם בסטטוס נמסר בהצלחה, או בעיה כלשהי, אלא אם תבחרו לסמן את השדה ';
  volunteerByFamilyDefault = 'הגדר מתנדב לפי מתנדב ברירת מחדל המוגדר למשפחה';
  volunteerByCrrentDelivery = 'הגדר מתנדב לפי המתנדב במשלוח הנוכחי';
  noVolunteer = 'ללא מתנדב';
  selectVolunteer = 'בחר מתנדב';
  frozens = 'קפואים';
  addressNotOkOpenWaze = "הכתובת אינה מדוייקת. בדקו בגוגל או התקשרו למשפחה. נשמח אם תעדכנו את הכתובת שמצאתם בהערות. האם לפתוח וייז?";
  wasCopiedSuccefully = " הועתקה בהצלחה";
  areYouSureYouWantToCancelAssignmentTo = "האם אתה בטוח שאתה רוצה לבטל שיוך ל";
  cancelAssignmentForHelperFamilies = 'בטל שיוך כל המשלוחים למתנדב';
  areYouSureYouWantToMarkDeliveredSuccesfullyToAllHelperFamilies = "האם אתה בטוח שאתה רוצה לסמן נמסר בהצלחה ל";
  markDeliveredToAllHelprFamilies = 'בטל שיוך כל המשלוחים למתנדב';
  smsMessageSentTo = "הודעת SMS נשלחה ל";
  messageCopied = "הודעה הועתקה";
  linkCopied = "קישור הועתק";
  clearAllVolunteerComments = 'נקה הערות לכל המתנדבים';
  clearAllVolunteerCommentsAreYouSure = 'האם אתה בטוח שברצונך לנקות את כל ההערות למתנדבים?';
  clearEscortInfo = 'נקה נתוני ליווי לכל המתנדבים';
  clearEscortInfoAreYouSure = 'האם אתה בטוח שברצונך לנקות את נתוני המלווים לכל המתנדבים?';
  resetPassword = 'אתחל סיסמה';
  resetPasswordAreYouSureFor = "האם את בטוחה שאת רוצה למחוק את הסיסמה של";
  passwordWasReset = "הסיסמה נמחקה";
  sendInviteBySms = 'שלח הזמנה בSMS למנהל';
  unfitForInvite = 'לא מתאים להזמנה';
  welcomeTo = 'ברוך הבא לסביבה של';
  pleaseEnterUsing = 'אנא הכנס למערכת באמצעות הקישור:';
  enterFirstTime = `מכיוון שלא מוגדרת לך סיסמה עדיין - אנא הכנס בפעם הראשונה, על ידי הקלדת מספר הטלפון שלך ללא סיסמה ולחיצה על הכפתור "כניסה". המערכת תבקש שתגדיר סיסמה וזו תהיה סיסמתך.
  בהצלחה`;
  inviteSentSuccesfully = 'הזמנה נשלחה בהצלחה';
  shouldAdd = 'האם להוסיף';
  minutesRemaining = 'דקות נשארו';
  familiesAddedSuccesfull = "הוספת השורות הסתיימה בהצלחה";
  gotoDeliveriesScreen = "האם לעבור למסך משלוחים או להשאר במסך זה?";
  shouldUpdateColumn = "האם לעדכן את השדה";
  forFamilies = "למשפחות";
  for = "ל";
  updateOfAddressMayTakeLonger = 'שים לב- עדכון של שדה כתובת יכול לקחת יותר זמן משדות אחרים';
  selectExcelSheet = 'בחר גליון מהאקסל';
  excelSheel = 'גליון';
  excelSheetIsEmpty = 'ריק';
  firstNameShort = 'פרטי';
  city = 'עיר';
  commentForAllDeliveries = 'הערה שתופיע לכל המשלוחים';
  defineDeliveriesForFamiliesInExcel = 'הגדר משלוחים לכל המשפחות מהאקסל';
  ifBasketTypeInExcelIsDifferentFromExistingOneCreateNewDelivery = 'אם קיים משלוח למשפחה עם סוג סל שונה, הוסף משלוח חדש';
  useFamilyMembersAsQuantity = 'השתמש במספר נפשות גם ככמות מנות';
  linesProcessed = 'שורות עובדו';
  alreadyExistsInLine = 'כבר קיים בקובץ בשורה';
  unnamed = 'ללא שם';
  sameLineExcelMatchesSeveralRowsInTheDatabase = 'אותה משפחה באתר מתאימה למספר שורות באקסל: ';

  manyAddressesEndWithNumber = "מהכתובות ריקות או מסתיימות בספרה - יתכן שלא קלטתם את הישוב של הכתובת. לחזור להגדרת עמודות?";
  moreThanOneRowInDbMatchesExcel = 'נמצאה יותר ממשפחה אחת באתר המתאימה לשורה הזו מהאקסל. אנא בחר איזו מהמשפחות הבאות מתאימה לשורה מהאקסל והעבר אותה למשפחות לעדכון';
  familyAlreadyRemovedFromList = 'משפחה מעודכנת בבסיס הנתונים כהוצא מהרשימות';
  moveTheFamily = 'להעביר את משפחת';
  addedToDb = 'נוספה לאתר';
  toNewFamilies = 'למשפחות חדשות';
  importFamily = 'לקלוט את משפחת';
  shouldCompare = 'האם להשוות את';
  compareTo = 'מול';
  andMoveToUpdateFamilies = 'ולהעביר למשפחות לעדכון';

  notImported = 'לא נקלטה';
  existsWithAnUpdate = 'קיימת עם עדכון';
  existsIdenticat = 'קיימת זהה';
  error = 'שגיאה';
  languageCode = 'iw';
  resetTextsToLanguageDefaults = 'החזר טקסטים להגדרות ברירת מחדל';
  no = 'לא';
  yes = 'כן';
  search = 'חיפוש';
  assigned = 'שוייך';
  familySourceName =  "שם";
  contactPersonName = "איש קשר";
  lineWithNoName = 'שורה ללא שם';
  smsLoginFailed = "משהו לא הסתדר עם הקישור, הנך מועבר למסך כניסה - אנא הכנס עם מספר הטלפון שלך";
  aMinuteAgo = 'לפני דקה';
  before = 'לפני';
  anHour = 'שעה';
  twoHours = "שעתיים";
  hours = "שעות";
  andAQuater = "ורבע";
  andThreeQuaters = 'ושלושת רבעי';
  andAHalf = 'וחצי';
  on= 'ב';
  days = 'ימים';
  yesterday = 'אתמול';
  twoDaysAgo = 'שלשום';
  thankYou= 'תודה';
  searchCompanyName = 'חיפוש שם חברה';
  confirmDeleteOf = "אישור מחיקה עבור ";
  originalAddress = 'כתובת מקורית';
  addGroupAssignmentVerb='להוסיף שיוך לקבוצה';
  removeGroupAssignmentVerb='להסיר שיוך לקבצה';
  replaceGroupAssignmentVerb='להחליף שיוך לקבוצה';
}

const defaultLang = new Language();
export var use = { language: defaultLang };


const langMap = new Map<string, Language>();
langMap.set('en', new en());
langMap.set('es', new es());
langMap.set('it', new italy());
function langByCode(lang: string) {
  let r = langMap.get(lang);
  if (!r)
    r = defaultLang;
  return r;
}

if (typeof (document) !== 'undefined'){
  //@ts-ignore
  use.language = langByCode(document.lang);
}
else
{
  
}