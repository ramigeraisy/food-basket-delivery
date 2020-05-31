import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as copy from 'copy-to-clipboard';
import { DialogService } from '../select-popup/dialog';
import { DeliveryStatus } from '../families/DeliveryStatus';
import { Context } from '@remult/core';

import { translate, use } from '../translate';
import { UpdateCommentComponent } from '../update-comment/update-comment.component';


import { ActiveFamilyDeliveries } from '../families/FamilyDeliveries';
import { ApplicationSettings } from '../manage/ApplicationSettings';
import { createElementCssSelector } from '@angular/compiler';

@Component({
  selector: 'app-family-info',
  templateUrl: './family-info.component.html',
  styleUrls: ['./family-info.component.scss']
})
export class FamilyInfoComponent implements OnInit {

  constructor(private dialog: DialogService, private context: Context, public settings: ApplicationSettings) { }
  @Input() f: ActiveFamilyDeliveries;
  @Input() showHelp = false;
  ngOnInit() {
  }
  actuallyShowHelp() {
    return this.showHelp && this.f.deliverStatus.value != DeliveryStatus.ReadyForDelivery;
  }
  @Input() partOfAssign: Boolean;
  @Output() assignmentCanceled = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  useWaze() {
    return this.settings.lang.languageCode == 'iw';
  }

  showCancelAssign(f: ActiveFamilyDeliveries) {
    return this.partOfAssign && f.courier.value != '' && f.deliverStatus.value == DeliveryStatus.ReadyForDelivery;
  }
  showFamilyPickedUp(f: ActiveFamilyDeliveries) {
    return f.deliverStatus.value == DeliveryStatus.SelfPickup;
  }
  async familiyPickedUp(f: ActiveFamilyDeliveries) {
    this.context.openDialog(UpdateCommentComponent, x => x.args =
    {
      family: f,
      comment: f.courierComments.value,
      helpText: s => s.commentForSuccessDelivery,
      ok: async (comment) => {
        f.deliverStatus.value = DeliveryStatus.SuccessPickedUp;
        f.courierComments.value = comment;
        f.checkNeedsWork();
        try {
          await f.save();
          this.dialog.analytics('Self Pickup');
        }
        catch (err) {
          this.dialog.Error(err);
        }
      },
      cancel: () => { }
    });

  }
  async cancelAssign(f: ActiveFamilyDeliveries) {

    this.assignmentCanceled.emit();

  }
  openWaze(f: ActiveFamilyDeliveries) {
    if (!f.addressOk.value) {
      this.dialog.YesNoQuestion(translate(use.language.addressNotOkOpenWaze), () => {
        if (this.useWaze())
          f.openWaze();
        else
          f.openGoogleMaps();
      });
    }
    else
      if (this.useWaze())
        f.openWaze();
      else
        f.openGoogleMaps();



  }
  udpateInfo(f: ActiveFamilyDeliveries) {
    f.showDetailsDialog({
      dialog: this.dialog,
      refreshDeliveryStats: () => {
        this.refreshList.emit();
      }
    });

  }
  copyAddress(f: ActiveFamilyDeliveries) {
    copy(f.address.value);
    this.dialog.Info(use.language.address + " " + f.address.value + " " + use.language.wasCopiedSuccefully);
  }
  showStatus() {
    return this.f.deliverStatus.value != DeliveryStatus.ReadyForDelivery && this.f.deliverStatus.value != DeliveryStatus.SelfPickup;
  }
}
