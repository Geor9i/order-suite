import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './homePage.module.scss'

export const homePageTemplate = (completion, progressReport, userData) => {
console.log(progressReport);

return html`
<div class=${styles["homepage-container"]}>
<p class=${styles['welcome-title']}>Welcome to Instill Flow</p>
${completion < 100 && progressReport ? progressTemplate(completion, progressReport, userData): null}
</div>
`};


const progressTemplate = (completion, progressReport, userData) => html`
<div class=${styles["progress-container"]}>
    <p class=${styles["storename"]}>${userData.storeName}</p>
    <p class=${styles["progress-title"]}>Profile Completion</p>
    <div class=${styles["progress-bar"]}>
        <div class=${styles["progress"]} style="width:${25}%"></div>
        <p class=${styles['progress-value']}>${completion} %</p>
    </div>
</div>
`;