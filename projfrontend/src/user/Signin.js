import React, {useState} from 'react';
import Base from "../core/Base";
import {Link} from "react-router-dom";
const Signin = () => {
  const signUpForm = ()=>{
    return(
      <div className="row">
        <div className="col-md-6 offset-sm-3 text-left">
          <form>
            <div className="form-group">
              <label className="text-light">Name</label>
              <input type="text"/>
            </div>
            <div className="form-group">
              <label className="text-light">Email</label>
              <input type="email"/>
            </div>
            <div className="form-group">
              <label className="text-light">Password</label>
              <input type="password"/>
            </div>
            <button className="btn btn-success btn-block">Submit!</button>
          </form>
        </div>
      </div>
    )
  }
  return (
    <Base title="Signin PAge" description="A page for signin">
        <h2>this is signin page</h2>
    </Base>
  );
}
export default Signin;