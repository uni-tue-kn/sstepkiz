import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Context } from '@sstepkiz';
import { ImeraApiService } from 'projects/imera-api/src/public-api';
import { StateService } from '../../Services/state.service';


@Component({
  selector: 'app-context-new',
  templateUrl: './context-new.component.html',
  styleUrls: ['./context-new.component.scss']
})
export class ContextNewComponent implements OnInit {

  routerLinkContinue = '/studie/neue-befragung/instrument';
  routerLinkBack = '/studie/befragungen';
  context: Context = new Context();
  
  constructor(private router: Router, private imeraApiService: ImeraApiService, private state: StateService) { }

  ngOnInit(): void {
  }

  save() {
    let newContext;
    this.imeraApiService.createNewContext(this.context)
      .then(
        data => {
          newContext = data;
          this.context.id = newContext.id;
          this.state.setCurrentContext(this.context);
          this.router.navigate([this.routerLinkContinue]);
        })
      .catch(
        error => console.log(error)
      );
  }
}
