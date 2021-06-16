import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AppService } from 'src/app/app.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { Category } from 'src/app/classes/Category';
import { Project } from 'src/app/classes/Project';

@Component({
  selector: 'app-project-registration',
  templateUrl: './project-registration.component.html',
  styleUrls: ['./project-registration.component.css']
})
export class ProjectRegistrationComponent implements OnInit {

  private servicesUrl = GlobalConstants.servicesUrl;

  public userId = Number(localStorage.getItem("userId"));

  public categories: Category[] = [];

  public title        = "";
  public description  = "";
  public projectPhoto = this.getDefaultProjectPhotoBase64();
  public category?: Category;
  
  public isValidTitle       = true;
  public isValidDescription = true;
  public isValidCategory    = true;

  constructor(private appService: AppService, private toastr: ToastrService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getCategories();
  }

  public projectRegistration() {
    if (!this.appService.validLogin()) {
      return;
    } 

    if (this.title.trim().length > 0) {
      this.isValidTitle = true;
    } else {
      this.isValidTitle = false;
    }

    if (this.description.trim().length > 0) {
      this.isValidDescription = true;
    } else {
      this.isValidDescription = false;
    }

    if (this.category && this.category.id > 0) {
      this.isValidCategory = true;
    } else {
      this.isValidCategory = false;
    }

    if (!this.isValidTitle || !this.isValidDescription || !this.isValidCategory) {
      this.toastr.error("Todos os campos devem ser preenchidos.");
      return;
    }

    const category = this.category ? this.category.id : 0;
    const project  = new Project(0, this.userId, category, this.title, this.description, this.projectPhoto);

    this.http.post<any>(this.servicesUrl + 'CreateProject.php', {'project': project}).subscribe(
      sucess => {
        if (sucess['status'] == 1) {
          this.toastr.success(sucess['message']);
        } else {
          this.toastr.success(sucess['message']);
        }
      },
      error => {
        this.toastr.error("Ocorreu um erro desconhecido ao gravar o projeto.");
        console.log(error);
      }
    )

  }

  public onFileChanged(event: Event) {
    const input = event.target as HTMLInputElement;
    let reader = new FileReader();

    if (input.files) {
      reader.readAsDataURL(input.files[0]);
      reader.onload = (event) => {
        const photo = event.target!.result;
        if (typeof photo == 'string') {
          this.projectPhoto = photo;
        }
      }
    }    
  }

  private getCategories() {
    this.appService.getCategories().then(categories => {
      this.categories = categories;
    });
  }

  private getDefaultProjectPhotoBase64() {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA81AAAPNQHh93XYAABjTElEQVR42u2dd7glRdGH32JJS0ZyzpIkS5AMAgISxQ8kCAiICibAgAgogoooSUUxoigoiCRFRXKUIJJzzixxBZZdwu7v+6Pnyt3dm8+cc3pmfu/zzHOVvbenu7pmuqa6uiokYapDRCwCbAJsCmwMfEDSs5aMMcaY4TCtRZA3ETE/acHvWfSXmuJXNgHOtKSMMcYMBxsAmRERc5O+7HsW/OUG+RMbAMYYY4aNDYAuExFzABvx7lf+SkAMo4lNLEVjjDHDJRwD0CXBR0wDXAesBUzTYnOLSXrCUjXGGDNUprEIuoOkScDEkubAXgBjjDHDwgZAd7m8pHY2tSiNMcYMBxsA3eWKktqxB8AYY8ywcAxAN4UfMSPwCjBjCc0tI+khS9UYY8xQsAegi0iaAPyrpObsBTDGGDNkbAB0H28DGGOM6Tg2ALpPWYGANgCMMcYMGccAdHsCIqYjxQHMXEJzK0i611I1xhgzGPYAdBlJbwPXltScjwMaY4wZEjYA8sBxAMYYYzqKDYA8KMsA2DgiotKSMMYY0xFsAOTBLcCrJbQzF7CyxWmMMWYwbABkgKSJwNUlNedtAGOMMYNiAyAfXBfAGGNMx7ABkA9lxQFsGBGjLE5jjDEDYQMgH24HXi6hndmB1S1OY5qNPwTMYExrEeSBJEXElcBHSmhuE+BmS9WYRnNrRMwBPAg8NMXPh4taJKbBOBNgTpMR8VngRyU0dbGkLS1RY5pJcRz4DfqvNCrgKd41CGwcNFFPbABk9dCuANxdQlPjgDmLLIPGmIYREYsAT4zwz6c0Dnr/fFjSeEu4JnpiAyC7B/c5YL4SmlpP0vWWqDHNIyI2obyTRb0R8DRTew1sHFQQxwDkxxXAx0poZ1PABoAxzWSZNrUbwMLFNWXOEUVEj3EwpffgbvlrMztsAORHWQbAJsAxFqcxjWTpLtyzP+PgTWAmkvfAZISPAeZHWfkA1o2IGSxOYxrJ0hn15WFJkzwl+WEDIDMkPUgKwGmVGYEPWKLGNJJlMurLg56OPLEBkCcuD2yMGRHFEcClMurSQ56VPLEBkCeuC2CMGSkLAqMz6o89AJliAyBPyvIArB0RM1mcxjSKnNz/YAMgW2wAZIikx4FHSmhqOmB9S9SYRpFTACDYAMgWGwD54jgAY8xIyMkDMIFygppNG7ABkC9lGQCOAzCmWeR2BNDn/zPFBkC+lGUArBERs1mcxjSGnAwAu/8zxgZApkh6Bri/hKZGARtYosbUn+IIYE4GgI8AZowNgLzxcUBjhkFENP2dtgAp7W4u2AOQMTYA8saBgMYMkYiYD7g4Ij7TYDH4CKAZMjYA8uZKyimgsUpEvMfiNHWlKH97K7AZcGJErNZQUeR2BNBbABljAyBjJL0A3FXSPG9kiZq6ERHTRMSRwCUk9zfADMDZETFrA0WSkwEwHh8BzBobAPnj44DG9EGPyx84ihTs2pulgV80UCw5bQH4CGDm2ADIn7ICAR0HYGrDFC7//tglIj7dMNH4CKAZMjYA8ucqoIxa2itGxLwWp6ky/bj8B+LEiFi1QSLyEUAzZGwAZI6ksaQvnTKwF8BUlkFc/v0xIw2JB4iIBYCZM+qSPQCZYwOgGvg4oGk0Q3T598cywM8aICYXATLDYlqLoBJcAXyphHYcCNgQImJGYE5gjil+TvnfRpO2mCb2+tnf/x4DnCzprQ6OYxrgcOBIhv7V3xe7RsSVkn5e42lfPrP+eAsg9/dEN4I0I2Jm4A1HiA5ZXrMCL1OOwbawpKct1crrRACLAytMcS1KWtxnKPmWVwO7dVJ3Cpf/7xnZV39fTADWlnRHTXXid8AemXRnPDCz3/F50y0PwB+AGSJiL0nPeRoGRtJrEfFvYJ0SmtuE9FI1FaD4Al6Sdxf4FYufy9GZlK+TgO8A35Q0sYPj3gQ4g6EF+g2VGYE/RcQakl6vobrklOvjIS/++dNxA6BI07lt8X/viIh9Jf3FUzEol1OOAbApNgCypAji+gCTf9EvS1q4usEYYA9Jl3ZQBmW5/PvjvaR4gN1rpjtLAItk1CXv/1eAjhoAEbE8cHyv/zQPcGFE/AT4kqTxnpJ+uQI4rIR2HAiYCRExGtgQ2BzYAlgpo+49DqxXcZd/f+xWxAPUKVFQbpk+vf9fAToWAxAR0wM3Aqv28yv3kPYYb/e09Cm/0cBYYPoSmltS0qOWasfnMICVSYv9FsD6dO/rfiBeIS3+93ZQNu1w+Q/EeFI8wJ010a3fk5dX4wBJP/VTnzedPAb4bfpf/CG5O2+MiIOKF6XpReEduaGk5uwF6BARsUBE7FkEaD0L3AYcR/rKzXHxfxvYoVOL/wgS+5TFaFI8wCw10LEFgY9m1q3X/PTnT0cMgIj4IHDIEH51BuAE4B8RMb+nZypcFyBzImLGiNgiIn4QEXcAzwC/JUVnz1eBIVws6eoOyWokiX3KZFmgDl+pX6L8Ux+tMs5vg/xpuwEQEXMBpwPD+arfArgzIrb1FE2G6wJkSkSsFRGnAs+RFrVDyGtPf6j8sUPyaiWxT5nsERH7Vljv5gb2z7BrNgAqQCc8AL8AFhzB381NESBY7H+btAVQRqDkghHxXouzNSJi3og4OCLuIsW3fAqYvcJDGg9c2GaZdcvlPxA/ioj3VXTOvkhe6X97sAFQAdpqAETEfsCOLTbzGeCWiFil6ZNVZGC7rqTmvA0wMp2eNiK2jYjzSLXOjyedza8Dz0pq295tBi7//uiJB8hxIR1InosAn820e29l2i/Ti7YZAMUX5kklNbc8DhDswXUBukBELBsR3wOeJH0l7wBMV7Nhti0gLiOXf38sR4XiASJiWlJCtVw9Tov6rZE/bTEAImI60pGeMi3q3gGCubgOu0FpcQA2pgbV41kjYt+IuA64D/gKUOfg1NINgExd/v3x8YjIcT+9L74FrJdx/5Zr7pujOrTLA/At4P1tansLUgbB7Ro6Z/8GykhjOg/1cV2XSkSsFBGnkY7t/RJYtyFDn6k4UlYm05ASHeXk8h+In0TE9pnr5xbAoZnLcdlmvTWqSekGQERsRPpSaidzAxc0MUBQ0jvANSU15ziAyXX3fRHxJ+B2YG/yDK5qNwe3QV93BV6syPhHAX8s3mM56uhywO8Y3qmqbtBID0BEzFaks64E05Q8+DkL5eyUAHoCBFdtmJ75OGC5evu+iDgbuIOUUKXJWyOfioj3lNmgpKeAPYGqFIeZkXQCadXM9HRt4Fpg3grIcNmIqIrXp6z5WQP4D6mORSUoe6GeFrirw2PoCRA8uEF72mUFAm5UJWu1DQ/sir0W/v+j2Qt/D7PQBg+epL+TMiBWhdmAiyMii332iNgKuAyYq0LyyzXgsx3z81ngemAp4IiIqIR3tdSXv6QXgA8DXwDe7OA4picdx7q4IQGCt5LqArTKnAycnrmuD+uKEXEWcCde+Pviy216gR1OecdYO8G8wFUR8fVuGsoRsRfp5EnVtqT2rPuDEhGzF9uGP+LdOi3TAGdWIZtt6UqtxA+BNYG7OzyezWlAgKCkScBVJTXXmG2AKRb+nfHCP9B74Yzi3H6ZevsO8DHgpQrJYhRwDPDPTr/QI2KxiLgA+A1dKN1eAjtGxKx1fUh6ufz7qsMwX/EMZe1hbVvniipb7wd+3OEx9QQI/rTmAYKuCzD0B3WFiPgjydXvhX9ozE8bXmAVjAfo4YPA7RGxX0S0Ne9+REwfEV8jVUit8sfMaPIrUlTWHPW4/Jcc4Nc2Jfd4AEltv0jbAmOKh76T1z3Aqp0YY6cvUp75MmT0KjBtTWW0MClZysQu6F5driPbNDfHVlgmzwBfBWYvWSazkE6f3Fsj/flXzd4pswPnDGP8E4FNcx1PFIPqhMU0H8mVtWWHbZy3gK8BJ6pTg+2MPKMwquYpobkPSLqh4iLpLZtpgANJJahr64LsEJOAzSRdUWajRSa7K8k7mc1gvEqqdXIhcKOkN0cghyBtw+0F7EQ9j57uIemMqg+icPmfzcBf/X0xhvQh+lx2Y+rkmlgo++eB79H58pWXAHtJerYuT1URwf5/JTR1mKTv1kQmK5NeymvVZZ4z4DnSC2xMyXO1MHAb1YlsH4gJpIJQV5LydDxNKojzBvCGpPHFluSypDPyyxfXOsAiDdCfZSW9WuH3yueAH/BuoN9wuRzYvIjfyocuuq/vovPuqBeA7WrkjvpMSXL5Zw1kMZrkVn4bu+3bcV0CTNOGedua5GWou/wmNmSc/V0nN8TlP9D1zdzG15UIRQcIlkarCYFeBs4lubUqS0RsXhiUX6Wa0dJVYDPg6214F/wN+H4D5DcNzQ4+PbBqFV17RfnvVFKT2eUHiG5vi0fEh4Ff0/nsVvcCu0m6rcpPVUQ8w9CLrPyX5J68nHSK4PYqx0VExDykAlF7VHkOK8REUjzAlSXPYx3iAczgPAysV/ZWUjsoweXfH1nFA3TdACiE3c0AwcOAE6q6EEbEGcBu/fzzOFLq0J4F/z+SJtbhTRIRexcPaB32j6vEs6QX2PMlz2ed4gFM/9wKbJxrPEBEzE76IP1IG2+TTTxAFgZAIXgHCI5MbvuSKtZBCkS6nrTYXw7cLOntOr09ImIZ4FRcyKibXAJsWfYLLCK2Bv6K8zTUnSsL/Xkzp05FxPuBsxh+lP9IOErSN7s+5tw+fIso7jPpfKnaF4H9JF1QpScpIhYB9iMt+Dfk9lCVOM5pSHv8R5KKtZjucoSkY9owz9+j/dVETfc5F9g5F49kG13+/TGJ5AW4vKvjztHzHREzFpNxYBdufypwiKQ3/Ixmow9zk4zCzS2NbJgIfFDSVWU2WsQDXAWsaxHXnuuB3SU91q0OdMjl3x9djwfI0gDoNTkfBk6jnGQ3w+E+YNeqBwjWgYhYi3QMp+5npavIM6QX2Aslz/kipL1ixwPUn1eBT0v6Q6dvHBHbkE6iLdbF8Xc1HiDrQgWSLiLlDPhHh2+9HKnE8CENKjGcHRFxAOnUghf/PFkQ+H3Zz4ikJ0mZ8WqTudP0y2ykynm/jYjZOnHDiFg0Is4H/kJ3F3/ocr2A7GvBF0dGtga+SOdLDP+AVAWsCSWGsyEiZoqI3wGn0Lk9OTMytiCdpCn7ub+IZuQHMIk9gcci4piyq1D2EBHTRcShpCPg22c09q7lB8h6C6CPCXSAYM0povzPBd5naVSGnoInV5esC9OSjrGubRE3ignA6cDxkh4oQY/WJR2V3pnObycPla7EA1TKACgms5sBgj8DDnaAYNvmdkdSPojZGi6KKtKueIBVgFuAURZx4xBwJ3A1aSvwmqEc1Y6IBYH3koKGdwWWqMh4Ox4PUDkDoNckdzNAcDdJt/r5LG0uRwHfBb5saVSai4Gtyk6qFREnk3KEGPMw8BQpydk44HVSwaW5SYv+MqSyylWlo/kBKmsAFC8GZxCsOMUcngVsZGnUgq9L+k7JOjI7cD8wXzVFYsyQ6Wh+gEobAND1DIKXkjIIPmO9HdHcrU8qROQgy/owEdhE0jUl68rHSfvCxtSdjsUDVN4A+N9Auhcg+BKwrwMEhz1f/wecAUxnadSOp0kvsBdL1pn7gGUtXtMAOhIPkP0xwKEi6Q5SieFTOnzruYDzI+LUiJjJejs4Rf2CP+LFv64sBPyuDTk0fm/RmobQkfwAtfEATDaolOHp1zhAMMe5OQg4Hhd8aQKHSfpuibqzBPCIxWoaQtvjAWppAABExPykAMEPdfjWbwFfJ51hdYDg5HPyTeAblkRjmEgq/XptiTp0LbCeRWsaQlvjAWqzBTAlhcC2Ag6i8xkEv0/KILig9TcFakbEiXjxbxqjgD8WxZzKwtsApknMB/yuXY3X1gAAUOIkYC3g7g7ffjPgjojYocnaW5zx/yUplbNpHgsBp5cYD3B5lYVhzDB5kZT4ri3U2gDooQgQXJPuBAieFxE/a2KAYERMB/wB2MfPcaPZCtivpLYeAd6xSE0DuIbk/r+4XTeobQxAvwPuboDg5pKeaoicRwN/Jr38jRkDLCPptRJ06wFSxjdj6ohIeW0OlzSxnTdqhAdgMslKfwVWJqUt7SQvA8/mJ5HyKcp6XowXf/Mu8wGfLqmtB6osCGMG4EVga0lfa/fiDw00AKArAYKvArt3YkK7TRHwdTmwgZ9lMwXrltSODQBTR64lufz/0akbNtIAgKkCBO9p8+0OkPRY3WUaEXMBVwFr+Fk2fbB6Se28YlGaGtHj8t9E0tOdvHFjDYD/Sf7dDII/adMtzpB0Rt3lWJRpvhBYwc+z6YeyAmGrXO3NmN68BHxY0qGSOh7c2ngDAEDSeEkHAtsCZdYzfww4oO7yi4hpSOez1637WE1LPF9SO7NalKYGXEdy+f+9Wx2wAdCLkgMEJ5L2/V9tgOiOB3ayBplBeLikdmwAmCoj4DhSlsyungqzATDlzJQXIHiMpOvrLq+I+AJO8mOGxi9LascGgKkqLwHbSPpqN1z+U9K4PADDEk4qMfwHhr+vfT2wYd2j/iPiI8CfsCHZKW4hpQV9CRgL/BeYl3Qmfhlg6eLnAhn2/RFSHoCWy5tGxK3AqlYHUzGuBz4m6clcOmQDYDABpYQ2P2Doe/mvkvZ1Hq25XD4AXAaMrtGw7gfOIRVzyol/AUcPda8wImbmXWNgSuNg/i70/23gg5KuKUHvZifl1LDRaaqCSGvIYTl89U/2PNkAGKKghp5B8OOSal2wJCKWIVmzc9dkSAJ+DHxV0viIuBjYIpO+/RnYuYwv52LuZmFyg6C3gTBfm8ZwoKSflNT/rYGL6vx8DYFXSLkQHgAeIhlErwKvFVdP3NGswGzFz1mB9xTzvCzwXmDOhsuxE7wM7FXEl2WHDYDhCGvwEsNnStq95jKYh/RFulRNhvQk8AlJl/Ua45LAXXTfu3EV8CFJHalmGRGzMrXHoOcaSersMcD+ki4ssY/fBQ6t+7umFxNI0eKXk3LD3yeplJNKRdKu5UlJuzYllVmesUGybTf/AnbJyeU/lQ7YABj2QxOkoLfvAjP0+qfHgFXqHPVfbIdcAaxdkyH9DvicpP/2MdZDiznuFi+Q9sz/m8ncz0b/xkFvT5BIsQoXAD+V9FLJ/biO+h83fQg4i7TFdn0HDcAZCtl+ENilmGczfEQ6GfW13Fz+U825DYARPyyrAGeSAgQnAhtJuq7G452G5I7eoQbDeRH4lKRzBxjvtMB/gJW61McfSfp8RXRjdmD24jkYJ2lsm+6zGGlxnLaGj9hY0qJ/ei6nhyJiXWBPkjEwRw1l3g7Gk45/n1eJZ9cGQEsPSE+A4AuSvlnzsf4Q+FwNhvJXYD9JY4Yw5nVI7tduBJytLekmP2WTzcfJQCWMomHwAPBN4NxOfemPQO4zAB8p+vlea2K//BfYtoxg147NrQ0AM4QXwMdIxyGrjIBvkPIzaBhjP4XOZ3N8SJLL3U4+D+8BngBmrsmQngOOAn6Zu5u41xxMC+xXPEfzV6HPHZ7PLSXdXqVO+yiNGeyhXxw4teLDeA3YUdLRGr7FexidL+N8qzVvKg6gHov/a8ARwNKSTq3K4g8g6R1Jp5JiA44oxmLgUWC9qi3+YAPADEBEjALOIO3vVpWHgHUkXTCSPy6C8Drtdn7Q2jeZHs5M9bef3gJ+CCwp6RhJ46o6EEnjJB0DLFmM6a0Gq+cEYHtJj1Sx8zYAzEAcQbUjrv8JrCWppXLPks4hxQ50ioesepPxI1LGwyoiUrDwcpK+IOnFukyKpBclfQFYrhhjE/eTvyjpzqp23jEApm/FiFgfuBIYVdEhHE9K7DOxJHksCtxDZ9zQG0i61loIEbEL8MeKdv85YKcm1AQp5mpd0kmhpsQH/EnSzpWeMxsApo8HeQ7gNmCxCnZ/AvDJdmRjjIiDgBM6MIYFiqJUTdfDxQs9rOIW1H9IruGnKtj3VuZsYVIOiNVrPtRHgdVyydMxUrwFYPriZ1Rz8X+NlDmvXamYf0h6sbeT1734/y/i/Eyqufj/ieTFadTiD1CMeYNCBnXmK1Vf/MEGgJmCiPgEUEW31svAZpKubtcNiu2E/UkJb9pF4/f/i/wa5wMfqFjXRTorv4ukN5o6f8XYdylkUU" + 
           "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" + 
           "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" + 
           "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" + 
           "D7FpsZI2l+S7OG+uFnxpgOP3QRCwNLAQsAC/b6ObOl0ycTgGdJX/k9Px+T9IhFM6iunY8NANMP01oExnQWSU8BT1kSxphu4hgAY4wxpoHYADDGGGMaiA0AY4wxpoHYADDGGGMaiA0AY4wxpoHYADDGGGMaiA0AY4wxpoE4D4AxGRARswCHWxJ9coqkJy0GY8rFBoAxeTAL8FWLoU/OB2wAGFMy3gIwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGojzABhjTH05HDipxTbeshjriQ0AY4ypKZLushRMf3gLwBhjjGkgNgCMMcaYBmIDwBhjjGkgNgCMMcaYBmIDwBhjjGkgNgCMMcaYBmIDwBhjjGkgIclSMKbbD2JEALNbEn3ymqSJFoMx5WIDwBhjjGkg3gIwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGogNAGOMMaaB2AAwxhhjGsi0FoEx3SciRgO7WBJ9cpGkFywGY8olJFkKxnT7QYyYH3jWkuiTD0i6wWIwply8BWCMMcY0EBsAxhhjTAOxAWCMMcY0EBsAxhhjTAOxAWCMMcY0EBsAxhhjTAOxAWCMMcY0EBsAxuTB2xaBZWNMJ7EBYEwevAy8YzH0iRMkGdMGbAAYkwFKKTnHWBJTMdFyMaY92AAwJh/8pTs1z0maaDEYUz42AIzJh5ssAsvEmE5hA8CYfDjPIpiKCy0CY9qDqwEak8vDGDEd8Dwwh6UBwCRgfpcCNqY92ANgTCZIehv4vSXxP/7mxd+Y9mEPgDE5PZAR8wEPAbM0XBSTgFUl3WmtMKY92ANgTEZIGgP8wJLgdC/+xrQXewCMye2hjJiZFP2+QkNF8CywhiQfizSmjdgDYExmSBoHbEfKDtg0JgA7ePE3pv3YADAmQyQ9DOxCs/LgC9hHks/+G9MBbAAYkymSLgU2B15swHDHATtJ+oNn3pjO4BgAY3J/SCOWAC4AVqrpEJ8Atpd0m2fbmM5hD4AxmSPpUWAt4KvA2BoNbTzwXWBlL/7GdB57AIyp0gMb8R7gUGA3YKGKDuMF4E/AtyU941k1pjvYADCmig9uRADvB3YAVgPmBxYA5iUfz55I8QvPFtfdpK2M61zhz5ju8/+kdCZoCMWqnwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAASdEVYdEVYSUY6T3JpZW50YXRpb24AMYRY7O8AAAAASUVORK5CYII="
  }

}
