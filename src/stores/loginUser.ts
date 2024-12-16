import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_USER } from "@/constants/user";

/**
 * 登录用户全局状态
 */
export const loginUserSlice = createSlice({
  name: "loginUser",
  initialState: DEFAULT_USER,
  reducers: {
    setLoginUser: (state, action: PayloadAction<API.LoginUserVO>) => {
      return {
        ...action.payload,
      };
    },

    // setUser: (state, action: PayloadAction<API.LoginUserVO>) => {
    //   // 直接修改 state，而不是返回新的对象
    //   state.userAvatar = action.payload.userAvatar;
    //   state.userName = action.payload.userName;
    //   state.userProfile = action.payload.userProfile;
    //   state.id = action.payload.id;
    //   // 你可以根据实际的 `LoginUserVO` 定义，调整这些字段
    // },

  },
});

// 修改状态
export const { setLoginUser} = loginUserSlice.actions;
// export const { setLoginUser,setUser } = loginUserSlice.actions;

export default loginUserSlice.reducer;
