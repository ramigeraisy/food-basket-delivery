import { StringColumn, NumberColumn, BoolColumn, ValueListColumn, ServerFunction } from '@remult/core';
import { GeocodeInformation, GetGeoInformation } from "../shared/googleApiHelpers";
import { Entity, Context, EntityClass } from '@remult/core';
import { PhoneColumn } from "../model-shared/types";
import { Roles } from "../auth/roles";
import { DeliveryStatusColumn, DeliveryStatus } from "../families/DeliveryStatus";
import { translate, translationConfig, TranslationOptionsColumn, Language, getLang, use, setLangForSite } from "../translate";

import { FamilySources } from "../families/FamilySources";
import { Injectable } from '@angular/core';
import { Helpers } from '../helpers/helpers';
import { BasketType } from '../families/BasketType';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Sites } from '../sites/sites';


@EntityClass
export class ApplicationSettings extends Entity<number>  {
  getInternationalPhonePrefix() {
    let r = this.forWho.value.args.internationalPrefixForSmsAndAws;
    if (!r)
      r = '+972';
    return r;
  }
  googleMapCountry() {
    let r = this.forWho.value.args.googleMapCountry;
    if (!r)
      r = 'IL';
    return r;
  }

  lang = getLang(this.context);
  @ServerFunction({ allowed: c => c.isSignedIn() })
  static async getPhoneOptions(deliveryId: string, context?: Context) {
    let ActiveFamilyDeliveries = await (await import('../families/FamilyDeliveries')).ActiveFamilyDeliveries;
    let d = await context.for(ActiveFamilyDeliveries).findFirst(fd => fd.id.isEqualTo(deliveryId).and(fd.isAllowedForUser()));
    if (!d)
      return [];
    let Families = await (await import('../families/families')).Families;
    let family = await context.for(Families).findFirst(f => f.id.isEqualTo(d.family));
    let r: phoneOption[] = [];
    let settings = await ApplicationSettings.getAsync(context);
    for (const x of settings.getPhoneStrategy()) {
      if (x.option) {
        await x.option.build({
          family: family,
          d: d,
          context: context,

          phoneItem: x,
          settings,
          addPhone: (name, phone) => r.push({ name: name, phone: phone })
        });
      }
    }
    return r;
  }
  showVideo() {
    return this.lang.languageCode == 'iw';
  }

  id = new NumberColumn();
  organisationName = new StringColumn(this.lang.organizationName);
  validateSmsContent(c: StringColumn) {
    return;
    if (c.value && c.value.indexOf("!אתר!") < 0 && c.value.indexOf("!URL!") < 0)
      c.validationError = this.lang.mustIncludeUrlKeyError;
  }
  smsText = new StringColumn({
    caption: this.lang.smsMessageContentCaption, validate: () => {
      this.validateSmsContent(this.smsText);
    }
  });
  reminderSmsText = new StringColumn({
    caption: this.lang.smsReminderMessageContentCaption,
    validate: () => {
      this.validateSmsContent(this.reminderSmsText);
    }
  });
  logoUrl = new StringColumn(this.lang.logoUrl);
  address = new StringColumn(this.lang.deliveryCenterAddress);
  commentForSuccessDelivery = new StringColumn(this.lang.successMessageColumnName);
  commentForSuccessLeft = new StringColumn(this.lang.leftByDoorMessageColumnName);
  commentForProblem = new StringColumn(this.lang.problemCommentColumnName);
  messageForDoneDelivery = new StringColumn(translate(this.lang.messageForVolunteerWhenDoneCaption));

  helpText = new StringColumn(this.lang.helpName);
  helpPhone = new PhoneColumn(this.lang.helpPhone);
  phoneStrategy = new StringColumn();
  getPhoneStrategy(): PhoneItem[] {
    try {
      return JSON.parse(this.phoneStrategy.value).map(x => {
        return {
          name: x.name,
          phone: x.phone,
          option: PhoneOption[x.option]
        };
      });
    }
    catch
    {
      return [{ option: PhoneOption.assignerOrOrg }];
    }
  }
  getQuestions(): qaItem[] {
    try {
      return JSON.parse(this.commonQuestions.value);
    }
    catch
    {
      return [];
    }
  }
  commonQuestions = new StringColumn();
  dataStructureVersion = new NumberColumn({ allowApiUpdate: false });
  deliveredButtonText = new StringColumn(this.lang.successButtonSettingName);
  message1Text = new StringColumn(this.lang.freeText1ForVolunteer);
  message1Link = new StringColumn(this.lang.urlFreeText1);
  message1OnlyWhenDone = new BoolColumn(this.lang.showText1OnlyWhenDone);
  message2Text = new StringColumn(this.lang.freeText2ForVolunteer);
  message2Link = new StringColumn(this.lang.urlFreeText2);
  message2OnlyWhenDone = new BoolColumn(this.lang.showText2OnlyWhenDone);
  forWho = new TranslationOptionsColumn();
  _old_for_soliders = new BoolColumn({ dbName: 'forSoldiers' });

  usingSelfPickupModule = new BoolColumn(this.lang.enableSelfPickupModule);
  showCompanies = new BoolColumn(this.lang.showVolunteerCompany);
  manageEscorts = new BoolColumn(this.lang.activateEscort);
  showHelperComment = new BoolColumn(this.lang.showHelperComment);
  showGroupsOnAssing = new BoolColumn(this.lang.filterFamilyGroups);
  showCityOnAssing = new BoolColumn(this.lang.filterCity);
  showAreaOnAssing = new BoolColumn(this.lang.filterRegion);
  showBasketOnAssing = new BoolColumn(this.lang.filterBasketType);
  showNumOfBoxesOnAssing = new BoolColumn(this.lang.selectNumberOfFamilies);
  showLeftThereButton = new BoolColumn(this.lang.showLeftByHouseButton);
  redTitleBar = new BoolColumn(this.lang.redTitleBar);
  defaultPrefixForExcelImport = new StringColumn(this.lang.defaultPhonePrefixForExcelImport);
  checkIfFamilyExistsInDb = new BoolColumn(this.lang.checkIfFamilyExistsInDb);
  removedFromListStrategy = new RemovedFromListExcelImportStrategyColumn(this.context);
  checkIfFamilyExistsInFile = new BoolColumn(this.lang.checkIfFamilyExistsInFile);
  excelImportAutoAddValues = new BoolColumn(this.lang.excelImportAutoAddValues);
  checkDuplicatePhones = new BoolColumn(this.lang.checkDuplicatePhones);


  addressApiResult = new StringColumn();
  defaultStatusType = new DeliveryStatusColumn(this.context, {
    caption: translate(this.lang.defaultStatusType)
  }, [DeliveryStatus.ReadyForDelivery, DeliveryStatus.SelfPickup]);
  private _lastString: string;
  private _lastGeo: GeocodeInformation;
  getGeocodeInformation() {
    if (this._lastString == this.addressApiResult.value)
      return this._lastGeo ? this._lastGeo : new GeocodeInformation();
    this._lastString = this.addressApiResult.value;
    return this._lastGeo = GeocodeInformation.fromString(this.addressApiResult.value);
  }
  boxes1Name = new StringColumn(this.lang.boxes1NameCaption);
  boxes2Name = new StringColumn(this.lang.boxes2NameCaption);


  constructor(private context: Context) {
    super({
      name: 'ApplicationSettings',
      allowApiRead: true,
      allowApiUpdate: Roles.admin,
      savingRow: async () => {
        if (context.onServer) {
          if (this.address.value != this.address.originalValue || !this.getGeocodeInformation().ok()) {
            let geo = await GetGeoInformation(this.address.value, context);
            this.addressApiResult.value = geo.saveToString();
            if (geo.ok()) {
            }
          }
          for (const l of [this.message1Link, this.message2Link]) {
            if (l.value) {
              if (l.value.trim().indexOf(':') < 0)
                l.value = 'http://' + l.value.trim();
            }
          }
          this.helpPhone.value = PhoneColumn.fixPhoneInput(this.helpPhone.value);
          setLangForSite(Sites.getValidSchemaFromContext(context), this.forWho.value.args.languageCode);
        }
      }
    })
  }

  static get(context: Context) {
    return context.for(ApplicationSettings).lookup(app => app.id.isEqualTo(1));

  }
  static async getAsync(context: Context): Promise<ApplicationSettings> {
    return (await context.for(ApplicationSettings).findFirst());
  }

}
export class PhoneOption {

  static assignerOrOrg = new PhoneOption("assignerOrOrg", "הטלפון ממנו יצא הSMS", async args => {
    if (args.settings.helpText.value) {
      args.addPhone(args.settings.helpText.value, args.settings.helpPhone.displayValue);
    }
    else {
      let h = await args.context.for(Helpers).lookupAsync(args.d.courierAssignUser)
      args.addPhone(h.name.value, h.phone.displayValue);
    }
  });
  static familyHelpPhone = new PhoneOption("familyHelpPhone", "איש קשר לבירור כפי שמוגדר למשפחה", async args => {
    if (args.family.socialWorker.value && args.family.socialWorkerPhone1.value) {
      args.addPhone(args.family.socialWorker.value, args.family.socialWorkerPhone1.displayValue);
    }
    if (args.family.socialWorker.value && args.family.socialWorkerPhone2.value) {
      args.addPhone(args.family.socialWorker.value, args.family.socialWorkerPhone2.displayValue);
    }
  });

  static familySource = new PhoneOption("familySource", "טלפון גורם מפנה", async args => {
    if (args.family.familySource.value) {
      let s = await args.context.for(FamilySources).findFirst(x => x.id.isEqualTo(args.family.familySource.value));
      if (s && s.phone.value) {
        let name = s.contactPerson.value;
        if (!name || name.length == 0) {
          name = s.name.value;
        }
        args.addPhone(name, s.phone.displayValue);
      }
    }
  });
  static otherPhone = new PhoneOption("otherPhone", "טלפון אחר", async args => {
    if (args.phoneItem.phone) {
      args.addPhone(args.phoneItem.name, PhoneColumn.formatPhone(args.phoneItem.phone));
    }
  });
  constructor(public key: string, public name: string, public build: ((args: phoneBuildArgs) => Promise<void>)) {

  }
}
export interface PhoneItem {
  option: PhoneOption;
  name?: string;
  phone?: string;
}
export interface phoneOption {
  name: string;
  phone: string;
}
export interface qaItem {
  question?: string;
  answer?: string;
}
export interface phoneBuildArgs {
  family: import('../families/families').Families,
  d: import('../families/FamilyDeliveries').FamilyDeliveries,
  context: Context,
  phoneItem: PhoneItem,
  settings: ApplicationSettings,
  addPhone: (name: string, value: string) => void
}


@Injectable()
export class SettingsService {
  constructor(private context: Context, private http: HttpClient) {

  }
  instance: ApplicationSettings;
  async init() {

    this.instance = await ApplicationSettings.getAsync(this.context);

    translationConfig.forWho = this.instance.forWho.value;
    DeliveryStatus.usingSelfPickupModule = this.instance.usingSelfPickupModule.value;
    Helpers.usingCompanyModule = this.instance.showCompanies.value;

    PhoneOption.assignerOrOrg.name = this.instance.lang.assignerOrOrg;
    PhoneOption.familyHelpPhone.name = this.instance.lang.familyHelpPhone;
    PhoneOption.familySource.name = this.instance.lang.familySourcePhone;
    PhoneOption.otherPhone.name = this.instance.lang.otherPhone;

    RemovedFromListExcelImportStrategy.displayAsError.caption = this.instance.lang.RemovedFromListExcelImportStrategy_displayAsError;
    RemovedFromListExcelImportStrategy.showInUpdate.caption = this.instance.lang.RemovedFromListExcelImportStrategy_showInUpdate;
    RemovedFromListExcelImportStrategy.ignore.caption = this.instance.lang.RemovedFromListExcelImportStrategy_ignore;


    BasketType.boxes1Name = this.instance.boxes1Name.value;
    BasketType.boxes2Name = this.instance.boxes2Name.value;


  }

}
export class RemovedFromListExcelImportStrategy {
  static displayAsError = new RemovedFromListExcelImportStrategy(0, 'הצג כשגיאה');
  static showInUpdate = new RemovedFromListExcelImportStrategy(1, 'הצג במשפחות לעדכון');
  static ignore = new RemovedFromListExcelImportStrategy(2, 'התעלם והוסף משפחה חדשה');
  constructor(public id: number, public caption: string) { }
}
class RemovedFromListExcelImportStrategyColumn extends ValueListColumn<RemovedFromListExcelImportStrategy>{
  constructor(context: Context) {
    super(RemovedFromListExcelImportStrategy, {
      caption: getLang(context).existsInRemovedFromListStrategy
      , dataControlSettings: () => ({
        valueList: this.getOptions(),

      })
    })
  }

}