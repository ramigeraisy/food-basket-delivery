
import { PostgresDataProvider, PostgresPool } from '@remult/server-postgres';
import { Families } from '../families/families';
import { BasketType } from "../families/BasketType";
import { ApplicationSettings, RemovedFromListExcelImportStrategy } from '../manage/ApplicationSettings';
import { ApplicationImages } from '../manage/ApplicationImages';
import { ServerContext, SqlDatabase, Column } from '@remult/core';
import '../app.module';



import { SqlBuilder } from '../model-shared/types';
import { FamilyDeliveries } from '../families/FamilyDeliveries';
import { DistributionCenters } from '../manage/distribution-centers';
import { pagedRowsIterator, iterateRowsActionOnServer } from '../families/familyActionsWiring';

export async function initSchema(pool1: PostgresPool, org: string) {

    console.log("init schema for ", org);
    var dataSource = new SqlDatabase(new PostgresDataProvider(pool1));
    let context = new ServerContext();
    context.setDataProvider(dataSource);
    let sql = new SqlBuilder();
    let createFamilyIndex = async (name: string, ...columns: Column<any>[]) => {
        await dataSource.execute(sql.build("create index if not exists ", name, " on ", f, "  (", columns, ")"));
    }
    let createDeliveryIndex = async (name: string, ...columns: Column<any>[]) => {
        await dataSource.execute(sql.build("create index if not exists ", name, " on ", fd, "  (", columns, ")"));
    }

    let f = context.for(Families).create();
    //create index for family deliveries if required
    var fd = context.for(FamilyDeliveries).create();



    if ((await context.for(BasketType).count() == 0)) {
        let h = context.for(BasketType).create();
        h.setEmptyIdForNewRow();
        h.name.value = 'רגיל';
        h.boxes.value = 1;
        await h.save();
    }


    /*await context.for(Families).foreach(f => f.addressLongitude.isEqualTo(0), async ff => {
        let g = ff.getGeocodeInformation();
        ff.addressOk.value = !g.partialMatch();
        ff.addressLongitude.value = g.location().lng;
        ff.addressLatitude.value = g.location().lat;
        ff.city.value = ff.getGeocodeInformation().getCity();
        await ff.save();
    });*/

    let settings = await context.for(ApplicationSettings).lookupAsync(s => s.id.isEqualTo(1));
    if (settings.isNew()) {
        settings.id.value = 1;
        settings.organisationName.value = 'שם הארגון שלי';
        settings.logoUrl.value = '/assets/apple-touch-icon.png';
        settings.smsText.value = 'שלום !מתנדב!\nלחלוקת חבילות !ארגון! לחץ על: !אתר! \nתודה !שולח!';
    }
    if (!settings.reminderSmsText.value)
        settings.reminderSmsText.value = 'שלום !מתנדב!, \nנשמח אם תעדכן את המערכת במצב המסירה של הסלים. לעדכון לחץ על:  !אתר!\nבתודה !ארגון!';

    if (!settings.commentForSuccessDelivery.value)
        settings.commentForSuccessDelivery.value = 'נשמח אם תכתוב לנו הערה על מה שראית והיה';
    if (!settings.commentForSuccessLeft.value)
        settings.commentForSuccessLeft.value = 'אנא פרט היכן השארת את הסל ועם מי דיברת';
    if (!settings.commentForProblem.value)
        settings.commentForProblem.value = 'נשמח אם תכתוב לנו הערה על מה שראית והיה';
    if (!settings.messageForDoneDelivery.value) {
        settings.messageForDoneDelivery.value = 'תודה על כל העזרה, נשמח אם תתנדבו שוב';
    }
    if (!settings.deliveredButtonText.value) {
        settings.deliveredButtonText.value = 'מסרתי את החבילה בהצלחה';
    }
    if (!settings.boxes1Name.value)
        settings.boxes1Name.value = 'מנות';
    if (!settings.boxes2Name.value)
        settings.boxes2Name.value = 'משהו אחר';
    await settings.save();


    let images = await context.for(ApplicationImages).findFirst(ap => ap.id.isEqualTo(1));
    if (!images) {
        images = context.for(ApplicationImages).create();
        images.id.value = 1;
        await images.save();
    }
    if (settings.dataStructureVersion.value == 0) {
        settings.dataStructureVersion.value = 1;
        await settings.save();


    }
    if (settings.dataStructureVersion.value == 1) {

        settings.dataStructureVersion.value = 2;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 2) {

        let f = context.for(Families).create();
        dataSource.execute(sql.update(f, {
            set: () => [[f.lastUpdateDate, f.createDate]]
        }));
        settings.dataStructureVersion.value = 3;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 3) {

        settings.dataStructureVersion.value = 4;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 4) {
        console.log("updating update date");
        let f = context.for(Families).create();
        dataSource.execute(sql.update(f, {
            set: () => [[f.lastUpdateDate, f.createDate]]
        }));
        settings.dataStructureVersion.value = 5;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 5) {

        settings.dataStructureVersion.value = 6;
        await settings.save();

    }
    if (settings.dataStructureVersion.value == 6) {
        settings.showLeftThereButton.value = true;
        settings.dataStructureVersion.value = 7;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 7) {
        settings.dataStructureVersion.value = 8;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 8) {
        if (org && settings.logoUrl.value == '/assets/apple-touch-icon.png') {
            settings.logoUrl.value = '/' + org + settings.logoUrl.value;
        }
        settings.dataStructureVersion.value = 9;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 9) {
        if ((await context.for(Families).count()) > 0)
            await dataSource.execute(sql.build('update ', fd, ' set ', fd.name, ' = ', f.name, ' from ', f, ' where ', sql.build(f, '.', f.id), ' = ', fd.family));
        settings.dataStructureVersion.value = 10;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 10) {
        settings.checkDuplicatePhones.value = true;
        settings.checkIfFamilyExistsInDb.value = true;
        settings.checkIfFamilyExistsInFile.value = true;
        settings.removedFromListStrategy.value = RemovedFromListExcelImportStrategy.displayAsError;
        settings.dataStructureVersion.value = 11;
        await settings.save();
    }
    if (settings.dataStructureVersion.value == 11) {
        await dataSource.execute(sql.build('create index if not exists fd_1 on ', fd, ' (', [fd.family, fd.deliveryStatusDate, fd.deliverStatus, fd.courier], ')'));
        //create index if required
        await dataSource.execute(sql.build('drop index if exists f_1  '));
        await dataSource.execute(sql.build('drop index if exists for_courier  '));
        await dataSource.execute(sql.build('drop index if exists for_distribution_status_queries  '));
        await dataSource.execute(sql.build('drop index if exists for_name  '));
        await dataSource.execute(sql.build('drop index if exists for_courier1  '));
        await dataSource.execute(sql.build('drop index if exists for_distribution_status_queries1  '));
        await dataSource.execute(sql.build('drop index if exists for_basket  '));
        await dataSource.execute(sql.build('drop index if exists for_basket_dist  '));
        await createDeliveryIndex('for_courier2', fd.courier, fd.deliveryStatusDate, fd.courierAssingTime, fd.city, fd.basketType);
        await createDeliveryIndex("for_distribution_status_queries2", fd.distributionCenter, fd.courier, fd.deliverStatus, fd.city, fd.basketType);
        await createFamilyIndex("for_name1", f.name, f.status, f.basketType);
        await createDeliveryIndex("for_name2", fd.name, fd.deliverStatus, fd.basketType);

        await createDeliveryIndex("for_distCenter_name1", fd.distributionCenter, fd.name, fd.deliverStatus, fd.basketType);
        await createDeliveryIndex("for_basket1", fd.basketType, fd.deliverStatus, fd.courier);
        await createDeliveryIndex("for_basket_dist1", fd.distributionCenter, fd.basketType, fd.deliverStatus, fd.courier);

        await dataSource.execute("create extension if not exists pg_trgm with schema pg_catalog;");
        await dataSource.execute(sql.build('create index if not exists for_like_on_groups on families using gin  (groups gin_trgm_ops)'));
        settings.dataStructureVersion.value = 12;
        await settings.save();
    }
    let version = async (ver: number, what: () => Promise<void>) => {
        if (settings.dataStructureVersion.value < ver) {
            try {
                console.log('start ', ver);
                await what();
                console.log('end ', ver);
            } catch (err) {
                console.error("failed for version ", ver, org, err);
                throw err;

            }
            settings.dataStructureVersion.value = ver;
            await settings.save();
        }
    }
    await version(13, async () => {
        if ((await context.for(Families).count()) > 0)
            await dataSource.execute(sql.update(f, {
                set: () => [
                    [f.status, sql.case([{ when: ['deliverstatus=99'], then: 99 }], 0)],
                    [f.statusUser, 'deliverystatususer'],
                    [f.statusDate, 'deliverystatusdate']
                ]


            }));
    })

    if (settings.dataStructureVersion.value == 13) {
        await pagedRowsIterator(context.for(Families), {
            forEachRow: async f => {
                f._suppressLastUpdateDuringSchemaInit = true;
                let g = f.getGeocodeInformation();
                f.addressByGoogle.value = g.getAddress();
                f.drivingLatitude.value = g.location().lat;
                f.drivingLongitude.value = g.location().lng;
                await f.save();
            },
            where: x => undefined,

        });
        settings.dataStructureVersion.value = 14;
        await settings.save();
    }

    await version(15, async () => {
        let fromArchive = (col: Column<any>) =>
            [col, 'archive_' + col.defs.dbName] as [Column<any>, any];
        if ((await context.for(Families).count()) > 0)
            await dataSource.execute(sql.update(fd, {
                set: () => [
                    [fd.archive, true],
                    [fd.name, 'familyname'],
                    [fd.createDate, fd.deliveryStatusDate],
                    fromArchive(fd.deliveryComments),
                    [fd.groups, 'archivegroups'],
                    [fd.familySource, 'archivefamilysource'],
                    fromArchive(fd.address),
                    fromArchive(fd.entrance),
                    fromArchive(fd.floor),
                    fromArchive(fd.addressComment),
                    fromArchive(fd.appartment),
                    fromArchive(fd.addressLongitude),
                    fromArchive(fd.city),
                    fromArchive(fd.addressLatitude),
                    [fd.drivingLongitude, fd.addressLongitude],
                    [fd.drivingLatitude, fd.addressLatitude],
                    [fd.addressByGoogle, fd.address],
                    [fd.addressOk, true],
                    fromArchive(fd.phone1Description),
                    fromArchive(fd.phone2),
                    fromArchive(fd.phone3),
                    fromArchive(fd.phone3Description),
                    fromArchive(fd.phone4),
                    fromArchive(fd.phone2Description),
                    fromArchive(fd.phone4Description),
                ]
            }));
    });
    await version(16, async () => {
        if ((await context.for(Families).count()) > 0)
            await dataSource.execute(sql.insert({
                into: fd,
                from: f,
                set: () => {
                    let r: [Column<any>, any][] = [
                        [fd.id, f.id],
                        [fd.family, f.id],
                        [fd.createDate, sql.case([{ when: ['deliverStatus in (0,2)'], then: 'deliveryStatusDate' }], 'courierAssingTime')],
                        [fd.createUser, 'courierAssignUser'],
                        [fd.distributionCenter, 'distributionCenter'],
                        [fd.deliverStatus, sql.case([{ when: ['deliverStatus=90'], then: '9' }], 'deliverStatus')]
                    ];
                    for (const c of [
                        fd.name,
                        fd.basketType,


                        fd.courier,
                        fd.courierComments,
                        fd.routeOrder,
                        fd.special,
                        fd.deliveryStatusDate,
                        fd.courierAssignUser,
                        fd.courierAssingTime,
                        fd.deliveryStatusUser,
                        fd.needsWork,
                        fd.needsWorkDate,
                        fd.needsWorkUser,
                        fd.deliveryComments,
                        fd.familySource,
                        fd.groups,
                        fd.address,
                        fd.floor,
                        fd.appartment,
                        fd.entrance,
                        fd.city,
                        fd.addressComment,
                        fd.addressLongitude,
                        fd.addressLatitude,
                        fd.addressByGoogle,
                        fd.addressOk,
                        fd.phone1,
                        fd.phone1Description,
                        fd.phone2,
                        fd.phone2Description,
                        fd.phone3,
                        fd.phone3Description,
                        fd.phone4,
                        fd.phone4Description

                    ]) {
                        r.push([c, c.defs.dbName])
                    }
                    return r;
                },
                where: () => ['deliverstatus not in (99,95)']
            }));

    });
    await version(17, async () => {
        await dataSource.execute(sql.build('drop index if exists for_distCenter_name  '));
    });
    await version(18, async () => {
        await dataSource.execute(sql.update(f, { set: () => [[f.quantity, 1]] }));
    });
    await version(19, async () => {
        await dataSource.execute(sql.update(fd, { set: () => [[fd.quantity, 1]] }));
    });
    await version(20, async () => {
        let dc = await context.for(DistributionCenters).find({ where: d => d.name.isEqualTo('נקודת חלוקה ראשונה') });
        for (const d of dc) {
            d.name.value = 'חלוקת מזון';
            await d.save();
        }
    });
    await version(21, async () => {
        if ((await context.for(Families).count()) > 0)
            await dataSource.execute(sql.update(fd, {
                set: () => [[fd.fixedCourier, f.fixedCourier], [fd.familyMembers, f.familyMembers]],
                from: f,
                where: () => [sql.eq(f.id, fd.family)]
            }));
    });
    await version(22, async () => {
        await pagedRowsIterator(context.for(Families), {
            where: f => f.addressOk.isEqualTo(false),
            forEachRow: async f => {
                f._suppressLastUpdateDuringSchemaInit = true;
                f.addressOk.value = !f.getGeocodeInformation().partialMatch();
                if (f.addressOk.value)
                    await f.save();
            }
        });
    });







    if ((await context.for(DistributionCenters).count() == 0)) {
        let h = context.for(DistributionCenters).create();
        h.setEmptyIdForNewRow();
        h.name.value = 'חלוקת מזון';
        h.address.value = settings.address.value;
        await h.save();
    }
}



//some index work for performance -
/* remove the blocked basket logic

/*select count(*) count from (select e1.id, e1.name, e1.phone, e1.smsDate, e1.reminderSmsDate, e1.company, e1.totalKm, e1.totalTime, e1.shortUrlKey, e1.eventComment, e1.needEscort, e1.theHelperIAmEscorting, e1.escort,
							(select count(*) from Families e2 where e2.courier = e1.id and deliverStatus = 0) deliveriesInProgress,
							(select count(*) from Families e2 where e2.courier = e1.id and deliverStatus <= 25) allFamilies,
							(select count(*) from Families e2 where e2.courier = e1.id and e2.deliverStatus in (21, 23, 25)) deliveriesWithProblems,
							(select max(e2.courierAssingTime) from Families e2 where e2.courier = e1.id and  not (e2.deliverStatus in (90, 95))) lastAsignTime,
							coalesce(  e1.smsDate> (select max(e2.courierAssingTime) from Families e2 where e2.courier = e1.id and  not (e2.deliverStatus in (90, 95))) + interval '-1' day,false) as gotSms

							from Helpers e1)
							result where deliveriesInProgress >= 1-- and gotSms <> true

drop index x7
create index x7 on families (courier,deliverstatus)

/*select count(*) count from Families where deliverStatus = 0 and courier = '' and special <> 1

 create index x6 on families(special,deliverstatus,courier)

/*select city, families from (select Families.city, count(*) families from Families Families where deliverStatus = 0 and Families.courier = '' group by Families.city) as result Order By families desc

create index x5 on families (deliverstatus,courier,city)

/* select count(*) count
 from Families where deliverStatus >= 0 and deliverStatus <= 2 and courier = ''
--and (select e1.blocked blockedBasket from BasketType e1 where e1.id = Families.basketType limit 1) = false
 and basketType = ''


create index x4 on families ( baskettype,courier,deliverstatus)


/* select id, name, tz, tz2, familyMembers, birthDate, cast(birthDate + ((extract(year from age(birthDate)) + 1) * interval '1' year) as date) as nextBirthday, basketType, familySource, socialWorker,
 socialWorkerPhone1, socialWorkerPhone2, groups, special, defaultSelfPickup, iDinExcel, internalComment, address, floor, appartment, entrance, city, addressComment, postalCode, deliveryComments,
 addressApiResult, phone, phone1Description, phone2, phone2Description, deliverStatus, courier, courierComments, deliveryStatusDate, fixedCourier, courierAssignUser, needsWork, needsWorkUser,
 needsWorkDate, courierAssingTime, deliveryStatusUser,
 --(select e1.blocked blockedBasket from BasketType e1 where e1.id = Families.basketType limit 1),
 routeOrder,
 --(select e1.deliverStatus prevStatus from FamilyDeliveries e1 where e1.family = Families.id order by e1.deliveryStatusDate desc limit 1),
 --(select e1.deliveryStatusDate prevDate from FamilyDeliveries e1 where e1.family = Families.id order by e1.deliveryStatusDate desc limit 1),
 --(select e1.courierComments prevComment from FamilyDeliveries e1 where e1.family = Families.id order by e1.deliveryStatusDate desc limit 1),
 --case when families.courier <> '' then exists (select 1 from FamilyDeliveries where family = families.id and courier = families.courier) else false end courierBeenHereBefore, case when (deliveryStatusDate > current_date -1 or deliverStatus = 0) then true else false end,

 addressLongitude, addressLatitude, addressOk, createDate, createUser, lastUpdateDate from Families where deliverStatus < 90 Order By name limit 50 offset 0
*/


/*create index xy on families using gin  (groups gin_trgm_ops)


select name, familiesCount from
 (select
  groups.name,
  (select count(*) from Families Families where Families.groups like '%'||groups.name||'%' and deliverStatus = 0 and courier = '' and (select e1.blocked blockedBasket from BasketType e1 where e1.id = Families.basketType limit 1) = false and (select e1.blocked blockedBasket from BasketType e1 where e1.id = Families.basketType limit 1) = false)
  familiesCount from groups groups) result where familiesCount > 0 Order By name limit 1000 offset 0*/

/*create index x3 on families ( name,deliverstatus)*/


