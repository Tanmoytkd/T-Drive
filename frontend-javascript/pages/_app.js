import 'antd/dist/antd.css';
import '../styles/globals.css';

import {Layout} from 'antd';
import LeftSideBar from "../components/LeftSideBar";
import {PageContextProvider} from "../lib/usePageContext";

const {Header, Content, Footer} = Layout;


function MyApp({Component, pageProps}) {

    return (
        <PageContextProvider>
            <Layout>
                <LeftSideBar/>

                <Layout className="site-layout" style={{marginLeft: 200}}>
                    <Header className="site-layout-background" style={{padding: 0}}/>
                    <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                        <div className="site-layout-background" style={{padding: 24}}>
                            {/*-----*/}
                            <Component {...pageProps} />
                            {/*-----*/}
                        </div>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>Ant Design ©2018 Created by Ant UED</Footer>
                </Layout>
            </Layout>
        </PageContextProvider>
    )
}

export default MyApp
