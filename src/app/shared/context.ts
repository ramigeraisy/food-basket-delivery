import { Entity, IDataSettings, GridSettings, Column, NumberColumn, DataList, EntityOptions } from "radweb";
import { EntitySourceFindOptions, FilterBase, FindOptionsPerEntity, DataProviderFactory, DataColumnSettings, DataApiRequest } from "radweb/utils/dataInterfaces1";
import { foreachSync } from "./utils";
import { evilStatics } from "../auth/evil-statics";
import { myAuthInfo } from "../auth/my-auth-info";
import { Injectable } from "@angular/core";
import { DataApiSettings } from "radweb/utils/server/DataApi";


@Injectable()
export class Context {
    isAdmin() {
        return this.info && this.info.admin;
    }
    isLoggedIn() {
        return !!this.info;
    }


    protected _getInfo = () => evilStatics.auth.info;
    protected _dataSource = evilStatics.dataSource;
    constructor() {

    }
    protected _onServer = false;
    get onServer(): boolean {
        return this._onServer;
    }

    get info(): myAuthInfo {
        return this._getInfo();
    }

    public create<lookupIdType, T extends Entity<lookupIdType>>(c: { new(...args: any[]): T; }) {
        let e = new c(this);
        e.setSource(this._dataSource);
        if (e instanceof ContextEntity) {
            e._setContext(this);
        }
        return e;
    }
    public for<lookupIdType, T extends Entity<lookupIdType>>(c: { new(...args: any[]): T; }) {
        return new SpecificEntityHelper<lookupIdType, T>(this.create(c), this._lookupCache);
    }
    private _lookupCache = new stamEntity();
}
export class ServerContext extends Context {
    constructor() {
        super();
        this._onServer = true;

    }
    private req: DataApiRequest<myAuthInfo>;

    setReq(req: DataApiRequest<myAuthInfo>) {
        this.req = req;
        this._getInfo = () => req.authInfo;
    }
    setDataProvider(dataProvider: DataProviderFactory) {
        this._dataSource = dataProvider;
    }
    getOrigin() {
        return this.req.getHeader('origin')
    }
}

function buildEntityOptions(o: ContextEntityOptions | string): EntityOptions | string {
    if (typeof (o) == 'string')
        return o;
    return {
        name: o.name,
        caption: o.caption,
        dbName: o.dbName,
        onSavingRow: o.onSavingRow,
    }
}

export class ContextEntity<idType> extends Entity<idType>{
    _noContextErrorWithStack: Error;
    constructor(private entityType: { new(...args: any[]): Entity<idType>; }, private contextEntityOptions?: ContextEntityOptions | string) {
        super(() => {
            if (!this.__context) {

                throw this._noContextErrorWithStack;
            }
            return this.__context.create(entityType);
        }, evilStatics.dataSource, buildEntityOptions(contextEntityOptions));
        this._noContextErrorWithStack = new Error('context was not set for' + this.constructor.name);
    }
    private __context: Context;
    _setContext(context: Context) {
        this.__context = context;
    }
    _getEntityApiSettings(r: Context): DataApiSettings<any> {


        let x = r.for(this.entityType).create() as ContextEntity<any>;
        if (typeof (x.contextEntityOptions) == "string") {
            return {}
        }
        else {
            let options = x.contextEntityOptions;
            if (options.allowApiCRUD) {
                options.allowApiDelete = true;
                options.allowApiInsert = true;
                options.allowApiUpdate = true;
            }
            return {
                allowRead: options.allowApiRead,
                allowUpdate: options.allowApiUpdate,
                allowDelete: options.allowApiDelete,
                allowInsert: options.allowApiInsert,
                excludeColumns: x => {
                    let r = x.__iterateColumns().filter(c => {
                        let y = <hasMoreDataColumnSettings><any>c;
                        if (y && y.__getMoreDataColumnSettings) {

                            if (y.__getMoreDataColumnSettings() && y.__getMoreDataColumnSettings().excludeFromApi)
                                return true;
                        }
                        return false;
                    });
                    return r;
                },
                readonlyColumns: x => {
                    let r = x.__iterateColumns().filter(c => c.readonly);

                    return r;
                },
                get: {
                    where: x => options.apiDataFilter ? options.apiDataFilter() : undefined
                }
            }
        }
    }
}
export interface hasMoreDataColumnSettings {
    __getMoreDataColumnSettings(): MoreDataColumnSettings<any, any>;
}
export interface MoreDataColumnSettings<type, colType> extends DataColumnSettings<type, colType> {
    excludeFromApi?: boolean;
}
export interface ContextEntityOptions {
    name: string;//required
    dbName?: string;
    caption?: string;
    allowApiRead?: boolean;
    allowApiUpdate?: boolean;
    allowApiDelete?: boolean;
    allowApiInsert?: boolean;
    allowApiCRUD?: boolean;
    apiDataFilter?: () => FilterBase;

    onSavingRow?: () => Promise<any>;
}
class stamEntity extends Entity<number> {

    id = new NumberColumn();
    constructor() {
        super(() => new stamEntity(), evilStatics.dataSource, "stamEntity");
        this.initColumns();
    }
}
export class SpecificEntityHelper<lookupIdType, T extends Entity<lookupIdType>> {
    constructor(private entity: T, private _lookupCache: Entity<any>) {

    }
    lookupAsync(filter: Column<lookupIdType> | ((entityType: T) => FilterBase)): Promise<T> {
        return this._lookupCache.lookupAsync(this.entity, filter);
    }
    lookup(filter: Column<lookupIdType> | ((entityType: T) => FilterBase)): T {
        return this._lookupCache.lookup(this.entity, filter);
    }
    async count(where?: (entity: T) => FilterBase) {
        let dl = new DataList(this.entity);
        return dl.count(where);
    }
    async foreach(where: (entity: T) => FilterBase, what?: (entity: T) => Promise<void>) {

        let options: EntitySourceFindOptions = {};
        if (where) {
            options.where = where(this.entity);
        }
        let items = await this.entity.source.find(options);
        return foreachSync(items, async item => await what(item));
    }
    async find(options?: FindOptionsPerEntity<T>) {
        let dl = new DataList(this.entity);
        return await dl.get(options);
    }
    async findFirst(where?: (entity: T) => FilterBase) {
        let r = await this.entity.source.find({ where: where ? where(this.entity) : undefined });
        if (r.length == 0)
            return undefined;
        return r[0];
    }
    create() {
        return this.entity.source.createNewItem();
    }
    gridSettings(settings?: IDataSettings<T>) {
        return new GridSettings(this.entity, settings);
    }
}