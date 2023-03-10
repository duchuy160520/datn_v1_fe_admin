import { Axios } from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";
import WsUrl from "../../utils/constants/WsUrl";
import { format } from 'date-fns'
import DateUtils from "../../utils/common/DateUtils";
import WSDateFormat from "../../utils/constants/WSDateFormat";
import ToastUtils from "../../utils/ToastUtils";
import WsToastType from "../../utils/constants/WsToastType";
import WsMessage from "../../utils/constants/WsMessage";
import { useForm } from "react-hook-form";
import HashSpinner from "../../component/spinner/HashSpinner";

let initPageInfo = {
  page: null,
  pageSize: null,
  totalElements: null,
  totalPages: null,
};

const initReq = {
  id: "",
  active: null,
  textSearch: "",
  topicId: null,
  pageReq: {
    page: 0,
    pageSize: 10,
    sortField: "",
    sortDirection: ""
  }
}

const Blog = () => {
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState(initPageInfo)
  const [req, setReq] = useState(initReq)
  const [blogs, setBlogs] = useState([]);
  const [topic, setTopic] = useState([])
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    featchBlogs();
  }, [req])

  useEffect(() => {
    getTopic()
  }, [])

  format(new Date(), 'dd/mm/yyyy')

  const getTopic = async () => {
    console.log("getTopic() start");
    setLoading(true)
    try {
      const res = await AxiosApi.getAuth(WsUrl.ADMIN_TOPIC)
      console.log("res", res);
      if (res) {
        const { data } = res
        console.log("getTopic data: ", data);
        setTopic(data.data)
      }
    } catch (e) {
      console.log("getTopic() error: ", e);
      ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const featchBlogs = async () => {
    const { data } = await AxiosApi.postAuth(WsUrl.ADMIN_BLOG_SEARCH, req)
    const blogs = data.data;
    setBlogs(blogs)
    setPageInfo({
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    })
  }


  const deleteBlog = async (id) => {
    setLoading(true)
    const res = await AxiosApi.postAuth(`${WsUrl.ADMIN_DELETE_BLOG}/${id}`)
    try {
      if (res) {
        ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.UPDATE_SUCCESS, 1000)
      }
    } catch (error) {
      ToastUtils.createToast(WsToastType.ERROR, WsMessage.UPDATE_FAIL, 1000)
    } finally {
      setLoading(false)
      featchBlogs()
    }
  }

  const changeStatusBlog = async (id) => {
    setLoading(true)
    const res = await AxiosApi.postAuth(`${WsUrl.ADMIN_CHANGE_STATUS_BLOG}/${id}`)
    try {
      if (res) {
        ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.UPDATE_SUCCESS, 1000)
      }
    } catch (error) {
      ToastUtils.createToast(WsToastType.ERROR, WsMessage.UPDATE_FAIL, 1000)
    } finally {
      setLoading(false)
      featchBlogs()
    }
  }



  const handleChangePageFilter = newPage => {
    setReq({
      ...req,
      pageReq: {
        ...req.pageReq,
        page: Number(newPage)
      }
    })
  }

  const handleChangePageSizeFilter = e => {
    setReq({
      ...req,
      pageReq: {
        ...req.pageReq,
        pageSize: Number(e.target.value)
      }
    })
  }
  const handleChangeStatusFilter = e => {
    let value = e.target.value
    console.log("handleChangeStatusFilter() value: ", value)
    if (value.length == 0) value = null;
    console.log("handleChangeStatusFilter() status: ", value)
    setReq({
      ...req,
      active: value,
      pageReq: {
        ...req.pageReq,
        page: 0,
      }
    })
  }
  const handleChangeOrderFilter = e => {
    const value = e.target.value
    console.log('handleChangeOrderFilter start with value: '.value);
    let sortField = ""
    let sortDirection = ""
    if (value.length > 0) {
      sortField = value.substring(0, value.indexOf('-'))
      console.log(sortField)
      sortDirection = value.substring(sortField.length + 1)
      console.log(sortDirection)
    }
    console.log("input: ", value, " - sortField: ", sortField, " - sortDirection: ", sortDirection)
    setReq({
      ...req,
      pageReq: {
        ...req.pageReq,
        sortField: sortField,
        sortDirection: sortDirection
      }
    })
  }
  const handleChangeTypeFilter = e => {
    let value = e.target.value
    if (value.length == 0) value = null
    console.log('handleChangeTypeFilter start with value: ', value);
    setReq({
      ...req,
      pageReq: {
        ...req.pageReq,
        page: 0,
      },
      topicId: value
    })
  }
  const handleChangeTextSearchFilter = values => {
    if (values.textSearch || values.textSearch.trim.length === 0) {
      setReq({
        ...req,
        pageReq: {
          ...req.pageReq,
          page: 0,
        },
        textSearch: values.textSearch
      })
    }
  }

  return (
    <div className="container-fluid w-100 reponsive">
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between">
          <h3 className="m-0 font-weight-bold text-primary">Danh s??ch b??i vi???t</h3>
          <NavLink to={'/blog/create'} className='btn btn-primary'>Th??m m???i</NavLink>
        </div>
        <div className="card-body">
          <div className='row d-flex align-items-center py-1'>
            <div className='col d-flex align-items-center'>
              <span className='' style={{ minWidth: '64px' }}>Th??? lo???i:</span>
              <select className='border-1 form-control col-2 mx-2'
                onChange={handleChangeTypeFilter}>
                <option value=''>T???t c???</option>
                {topic && topic.map((obj, index) => (
                  <option key={index} value={obj.id}>{obj.name}</option>
                ))}
              </select>
              <span className='' style={{ minWidth: '64px' }}>Tr???ng th??i</span>
              <select className='border-1 form-control col-2 mx-2'
                onChange={handleChangeStatusFilter}>
                <option value=''>T???t c???</option>
                <option value={true}>Hi???n th???</option>
                <option value={false}>T???m ???n</option>
              </select>
              <span className='' style={{ minWidth: '64px' }}>Ng??y t???o:</span>
              <select className='border-1 form-control col-2 mx-2' onChange={handleChangeOrderFilter}>
                <option value='createdDate-desc'>M???i nh???t</option>
                <option value='createdDate-asc'>C?? nh???t</option>
              </select>
            </div>


            <form className="d-none d-sm-inline-block form-inline navbar-search col-4"
              onSubmit={handleSubmit(handleChangeTextSearchFilter)}>
              <div className="input-group">
                <input type="text" className="form-control bg-light border-0 small"
                  placeholder="T??m ki???m..." aria-label="Search" aria-describedby="basic-addon2"
                  defaultValue=""
                  {...register("textSearch")} />
                <div className="input-group-append">
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-search fa-sm" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          <hr className='pb-2' />
          <div><h6>T??m th???y <b>{pageInfo.totalElements}</b> d??? li???u ph?? h???p.</h6>
          </div>
          <div className='table-responsive'>
            <table className="table table-bordered mt-4" id="dataTable" width="100%" cellSpacing={0}>
              <thead>
                <tr className='text-bold text-dark'>
                  <th>#</th>
                  <th className='text-center' style={{
                    maxWidth: '40px'
                  }}>Ti??u ?????</th>
                  <th className=''>C???p nh???t l??c</th>
                  <th className='text-center'>Xem b??i vi???t</th>
                  <th className='text-center'>Tr???ng th??i</th>
                  <th className=''>More</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <HashSpinner /> : blogs && blogs.map((blog, index) => (
                  <tr key={blog.id}>
                    <td>{index + 1}</td>
                    <td className="col-6" style={{ border: `1px 0px 1px 0px` }} >
                      <td className="col-4 text--start" style={{ border: `none` }}> <img style={{ width: 150 }} src={blog.image} alt="" /></td>
                      <td className="col-8 text-start" style={{ border: `none` }}>{blog.title}</td>
                    </td>
                    <td>{DateUtils.dateToString(blog.createdDate, WSDateFormat.F_DDMMYYYYHHMM)}</td>
                    <td  className='text-center'> <a  target="_blank" href={"http://localhost:4200/blog/" + blog.id}>Link</a>
                    </td>
                    <td className='text-center' style={{ minWidth: '80px' }}>
                      <span className={`btn text-light badge badge-pill badge-success`}
                        data-toggle="modal"
                        data-target={`#changeStatusModal${blog.id}`}>{blog.active == true ? "Hi???n th???" : ""}</span>
                      <span className={`btn text-light badge badge-pill badge-danger`}
                        data-toggle="modal"
                        data-target={`#changeStatusModal${blog.id}`}>{blog.active == false ? "T???m ???n" : ""}</span>
                      <div className="modal fade" id={`changeStatusModal${blog.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">Thay ?????i tr???ng th??i</h5>
                              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">??</span>
                              </button>
                            </div>
                            <div className="modal-body">
                              B???n c?? ch???c mu???n thay ?????i tr???ng th??i b??i vi???t  kh??ng?  <br /> <b style={{ color: "red" }}>{blog.title}</b><br />
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                              <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => changeStatusBlog(blog.id)} >X??c nh???n</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="btn-group dropleft">
                        <a className="btn text-dark" type="button" id="dropdownMenuButton"
                          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i className="fa fa-ellipsis-h" aria-hidden="true" />
                        </a>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                          <NavLink to={`detail/${blog.id}`} className="dropdown-item">Ch???nh s???a</NavLink>
                          <a className="dropdown-item" href="#" data-toggle="modal"
                            data-target={`#deleteModal${blog.id}`}>X??a</a>
                        </div>
                      </div>
                      <div className="modal fade" id={`deleteModal${blog.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">X??a b??i vi???t</h5>
                              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">??</span>
                              </button>
                            </div>
                            <div className="modal-body">
                              B???n c?? ch???c mu???n x??a b??i vi???t  kh??ng?<br /> <b style={{ color: "red" }}>{blog.title}</b> <br />
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                              <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={() => deleteBlog(blog.id)}>X??a</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="modal fade" id={`changeStatusModal${blog.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">Thay ?????i tr???ng th??i</h5>
                              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">??</span>
                              </button>
                            </div>
                            <div className="modal-body">
                              B???n c?? ch???c mu???n thay ?????i tr???ng th??i b??i vi???t <br />
                              {blog.title}
                              kh??ng? <br />
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                              <button type="button" className="btn btn-primary" data-dismiss="modal" >X??c nh???n</button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>


          {pageInfo.totalElements > 0 && <div className='py-2 row align-items-center justify-content-between'>
            <div className='col d-flex align-items-center'>
              Hi???n th???: <select className='border-1 form-control col-1 mx-2'
                onChange={handleChangePageSizeFilter}>
                <option value={10} defaultChecked>10</option>
                <option value={20}>20</option>
                <option value={10}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className=''>
              <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                onClick={() => handleChangePageFilter(pageInfo.page - 1)}
                disabled={pageInfo.page == 0}>Tr?????c
              </button>
              <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                onClick={() => handleChangePageFilter(pageInfo.page + 1)}
                disabled={pageInfo.page == pageInfo.totalPages - 1}>Sau
              </button>
              <span>Trang {pageInfo.page + 1}/{pageInfo.totalPages}</span>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default Blog;
