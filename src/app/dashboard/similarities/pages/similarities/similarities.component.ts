import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-similarities",
  templateUrl: "./similarities.component.html",
  styleUrls: ["./similarities.component.scss"],
})
export class SimilaritiesComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      similarCount: [null],
      suraCount: [null],
    });

    this.loadFromLocalStorage();
  }
  
  similarNumbers = [1,2,3,4,5,6,7];
  suraNumbers = [1,2,3,4,5,6];
  
  save() {
    const data = this.form.value;
    localStorage.setItem('motashabehatSettings', JSON.stringify(data));
  }

  loadFromLocalStorage(): void {
    const saved = localStorage.getItem("motashabehatSettings");

    if (saved) {
      this.form.patchValue(JSON.parse(saved));
    }
  }
}
