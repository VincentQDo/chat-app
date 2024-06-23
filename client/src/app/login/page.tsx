export default function Login() {
    return(<div>
        <label>
            Username:
            <input className="bg-black" name="username"></input>
        </label>
        <label>
            Password: 
            <input className="bg-black" name="password"></input>
        </label>
    </div>)
}