import {Button, Form, Input} from 'antd';
import useUser from "../lib/useUser";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 12,
    },
};
/* eslint-disable no-template-curly-in-string */

const validateMessages = {
    required: '${label} is required!',
    types: {
        email: '${label} is not a valid email!',
        number: '${label} is not a valid number!',
    },
    number: {
        range: '${label} must be between ${min} and ${max}',
    },
};
/* eslint-enable no-template-curly-in-string */

export default function RegisterPage() {

    useUser({redirectTo: '/', redirectIfFound: true})

    const handleSubmit = async (values) => {
        const {name, email, password} = values.user;
        let url = 'http://localhost:3000/register';
        let requestBody = {
            email: email,
            password: password,
            name: name,
        };

        let response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        let data = await response.json();
        console.log(data);

        //start login
        url = 'http://localhost:3000/login';
        requestBody = {
            email: email,
            password: password,
        };

        response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        data = await response.json();
        console.log(data);
    };

    return (
        <Form {...layout} name="nest-messages" onFinish={handleSubmit} validateMessages={validateMessages}>
            <Form.Item
                name={['user', 'name']}
                label="Name"
                rules={[{required: true}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name={['user', 'email']}
                label="Email"
                rules={[{type: 'email'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                label="Password"
                name={['user', 'password']}
                rules={[{required: true, message: 'Please input your password!'}]}
            >
                <Input.Password/>
            </Form.Item>

            <Form.Item wrapperCol={{...layout.wrapperCol, offset: 4}}>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
            </Form.Item>
        </Form>
    );
};