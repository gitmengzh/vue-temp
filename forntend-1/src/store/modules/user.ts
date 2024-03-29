import { loginApi, logoutApi } from "@/api/auth";
import { getUserInfoApi } from "@/api/user";
import { resetRouter } from "@/router";
import { store } from "@/store";

import { LoginData } from "@/api/auth/types";
import { UserInfo } from "@/api/user/types";

export const useUserStore = defineStore("user", () => {
  const user: UserInfo = {
    roles: [],
    perms: [],
  };

  /**
   * 登录
   *
   * @param {LoginData}
   * @returns
   */
  function login(loginData: LoginData) {
    try {
      return new Promise<void>((resolve, reject) => {
        loginApi(loginData)
          .then((response) => {
            console.log(33333);
            const { accessToken, userId } = response.data;
            localStorage.setItem("token", accessToken); // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
            localStorage.setItem("userId", userId);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error(error);
    }
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo(userId: string) {
    return new Promise<UserInfo>((resolve, reject) => {
      getUserInfoApi(userId)
        .then(({ data }) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          if (!data.roles || data.roles.length <= 0) {
            reject("getUserInfo: roles must be a non-null array!");
            return;
          }
          Object.assign(user, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // user logout
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          localStorage.setItem("token", "");
          location.reload(); // 清空路由
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // remove token
  function resetToken() {
    console.log("resetToken");
    return new Promise<void>((resolve) => {
      localStorage.setItem("token", "");
      resetRouter();
      resolve();
    });
  }

  return {
    user,
    login,
    getUserInfo,
    logout,
    resetToken,
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
