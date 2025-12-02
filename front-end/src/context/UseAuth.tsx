import React, { createContext, use, useEffect } from "react";
import type { UserProfile } from "../models/User";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAPI,loginAPI } from "../services/AuthService";
import { toast } from "react-toastify";
type useContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (username: string, email: string, password: string) => void;
    loginUser: (email: string, password: string) => void;
    logout: () => void;
    isloggedIn: () => boolean;
};

type Props ={ children: React.ReactNode };

const userContext = createContext({} as useContextType);

export const UserProvider = ({children}:Props) => {
    const navigate = useNavigate();
    const [token, setToken] =  useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (user && token) {
            setUser(JSON.parse(user));
            setToken(token);
        }
        setIsReady(true);
    },[])
 const registerUser = async(username:string,email:string,password:string) =>{
    await registerAPI(username,email,password).then((res)=>{
        if(res){
            localStorage.setItem("token",res?.data.accessToken);
            const userObj ={
                userName: res?.data.userName,
                email: res?.data.email,
                roles: res?.data.roles
            }
            localStorage.setItem("user",JSON.stringify(userObj));
            setUser(res?.data.accesstoken!);
            setUser(userObj);
            toast.success("Registration Successful");
            navigate("/login");
        };

    }).catch((err)=>{
        toast.error("Registration Failed");
    });
 };

 const loginUser = async(email:string,password:string) =>{
    await loginAPI(email,password).then((res)=>{
        if(res){
            localStorage.setItem("token",res?.data.accessToken);
            const userObj ={
                userName: res?.data.userName,
                email: res?.data.email,
                roles: res?.data.roles
            }
            localStorage.setItem("user",JSON.stringify(userObj));
            setUser(res?.data.accesstoken!);
            setUser(userObj);
            toast.success("Registration Successful");
            navigate("/Home");
        };

    }).catch((e)=>{
        toast.error("Registration Failed");
    });

 };
const isloggedIn = () : boolean => {
        return !!user;
    };
const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
        navigate("/");
    };
 return (
    <userContext.Provider value={{loginUser,user,token,logout,isloggedIn,registerUser}}>
        {isReady ? children :null}
    </userContext.Provider>
 )
};

export const useAuth = () => React.useContext(userContext);