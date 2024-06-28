import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './homePage.module.scss'

export const homePageTemplate = (completion, progressReport, userData) => {
return html`
<div class=${styles["container"]}>
 ${userData?.STORE_NAME ? html`<p class=${styles["storename"]}>${userData.STORE_NAME}</p>` : null}   
${completion < 100 && progressReport ? progressTemplate(completion, progressReport, userData): null}
</div>
`};


const progressTemplate = (completion, progressReport) => html`

<div class=${styles["progress-report"]}>
${Object.keys(progressReport).map(area => {
    if (progressReport[area].untouched) {
        return html`<p class=${styles['report-general-notification']}>Please complete ${progressReport[area].title} <a class=${styles['link']} href=${progressReport[area].link}>here</a></p>`
    } else {
        return console.log('else');
    }
})}
</div>

<div class=${styles["progress-container"]}>
    <p class=${styles["progress-title"]}>Profile ${completion < 100 ? 'incomplete' : 'complete'}</p>
    <div class=${styles["progress-bar"]}>
        <div class=${styles["progress"]} style="width:${completion}%"></div>
        <p class=${styles['progress-value']}>${completion} %</p>
    </div>
</div>
`;