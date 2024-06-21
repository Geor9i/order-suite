import { html } from "lit-html";
import styles from './loginPage.module.scss'

export const loginPageTemplate = (submitHandler) => html`
 <div class=${styles['login-container']}>
        <form @submit=${submitHandler} class=${styles['login-form']}>
          <div class=${styles['input-container']}>
            <label for="email">Email</label>
            <input type="text" id="email" name="email" />
          </div>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="password">Password</label>
            <input type="password" id="passsword" name="password" />
          </div>
          <button class=${styles['submit-btn']}>Login</button>
          <p class=${styles["register-banner"]}>Don't have an account? Register <a href="register">here</a></p>
        </form>
      </div>`