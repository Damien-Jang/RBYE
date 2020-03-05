import * as React from "react";
import Layout from "../../components/Layout";
import JobList from "../../components/JobList";
import NavBar from "../../components/NavBar";
import fetch from "isomorphic-unfetch";

interface QueryType {
  type: string;
}

interface Props {
  data?: Job[];
  updated?: string[];
  query?: QueryType;
}

export default function Post(props: Props) {
  const [data, setData] = React.useState(props.data);
  const [year, setYear] = React.useState(0);
  const [searchKeyword, setSearchKeyword] = React.useState("");

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query.type}?contentObj.requirement_like=${year}년`
      );
      const newData = await res.json();
      await setData(newData);
    }

    if (year === 0) {
      return setData(props.data);
    }

    if (year > 0) {
      getData();
    }
  }, [year]);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query.type}?q=${searchKeyword}`
      );
      const newData = await res.json();
      await setData(newData);
      await setYear(0);
    }
    getData();
  }, [searchKeyword]);

  const displayYear = () => {
    let temp = [];
    for (let i = 1; i < 11; i += 1) {
      temp.push(
        <span
          key={i}
          className={
            year === i ? "m-1 text-gray-500 text-lg" : "m-1 hover:text-gray-500"
          }
          onClick={() => {
            setYear(i);
            setSearchKeyword("");
          }}
        >
          [{i}
          년]
        </span>
      );
    }
    return temp;
  };

  let dataLength: number = 0;
  if ((year && data.length) || searchKeyword) {
    dataLength = data.length;
  } else if (!year) {
    dataLength = props.data && props.data.length;
  }

  return (
    <Layout title={`${props.query.type} 연차별 요구사항`}>
      {/* <h1 className="text-center">{props.query.type} 연차별 요구사항 보기</h1> */}
      <NavBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />
      <div className="block m-auto lg:max-w-6xl">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-wrap cursor-pointer">
            {displayYear()}
            <span
              className={
                year === 0
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setYear(0);
                setSearchKeyword("");
              }}
            >
              [전체]
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            데이터 수 {dataLength} 데이터 업데이트{" "}
            {props.updated && props.updated[0]}
          </span>
        </div>
        <JobList data={data} searchKeyword={searchKeyword} />
      </div>
    </Layout>
  );
}

Post.getInitialProps = async function({ query }) {
  const res = await fetch(`https://rbye-api.lastrites.now.sh/${query.type}`);
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data = await res.json();
  const updated = await res2.json();

  return {
    data,
    updated,
    query
  };
};