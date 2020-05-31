import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApplicationSettings } from '../../manage/ApplicationSettings';

@Component({
  selector: 'app-yes-no-question',
  templateUrl: './yes-no-question.component.html',
  styleUrls: ['./yes-no-question.component.scss']
})
export class YesNoQuestionComponent implements OnInit {
  public args: {
    onYes?: () => void;
    onNo?: () => void;
    showOnlyConfirm?: boolean;
    question: string;
  };
  confirmOnly = false;
  question: string;
  constructor(
    private dialogRef: MatDialogRef<any>,
    public settings:ApplicationSettings

  ) {
    dialogRef.afterClosed().subscribe(s => {
      if (!this.yes && this.args && this.args.onNo)
        this.args.onNo();
    });
  }

  ngOnInit() {
    if (this.args && this.args.showOnlyConfirm)
      this.confirmOnly = this.args.showOnlyConfirm;
    if (!this.question)
      this.question = this.args.question;
  }
  close() {
    this.dialogRef.close();
  }
  yes = false;
  select() {
    this.yes = true;
    this.dialogRef.close();
    if (this.args.onYes)
      this.args.onYes();
  }
}
