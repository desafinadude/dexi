import React from "react";
import Dropzone from "react-dropzone";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import { isTokenSet, getCookie } from '../utils/utils';




export class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.upload = this.upload.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      selectedFiles: undefined,
      progressInfos: [],
      message: [],
      fileInfos: [],
      uploading: false,
    };
  }

  componentDidMount() {
  }

  uploadFile(file, onUploadProgress) {
    let formData = new FormData();

    formData.append("file", file);
    formData.append("action", "upload");

    return axios.post(process.env.API + '/dexi/project/' + this.props.project.id + '/docs', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "token " + getCookie('dexitoken')
      },
      onUploadProgress,
    });
  }

  upload(idx, file) {
    let _progressInfos = [...this.state.progressInfos];

    this.uploadFile(file, (event) => {
      _progressInfos[idx].percentage = Math.round(
        (100 * event.loaded) / event.total
      );
      this.setState({
        _progressInfos,
      });
    })
      .then((response) => {
        this.setState((prev) => {
          let nextMessage = [
            ...prev.message,
            'UPLOADED: ' + file.name,
          ];
          return {
            message: nextMessage,
          };
        });
        this.props.onGetDocs();
      })
      .catch(() => {
        _progressInfos[idx].percentage = 0;
        this.setState((prev) => {
          let nextMessage = [
            ...prev.message,
            'ERROR: ' + file.name,
          ];
          return {
            progressInfos: _progressInfos,
            message: nextMessage,
          };
        });
      });
  }

  uploadFiles() {
    const selectedFiles = this.state.selectedFiles;

    let _progressInfos = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      _progressInfos.push({ percentage: 0, fileName: selectedFiles[i].name });
    }

    this.setState(
      {
        progressInfos: _progressInfos,
        message: [],
        uploading: true,
      },
      () => {
        for (let i = 0; i < selectedFiles.length; i++) {
          this.upload(i, selectedFiles[i]);
        }
        this.props.onGetDocs();
      }
    );
  }

  onDrop(files) {
    if (files.length > 0) {
      this.setState({ selectedFiles: files });
    }
  }

  render() {
    const { selectedFiles, progressInfos, message, fileInfos } = this.state;

    return (
      <div>
        {progressInfos &&
          progressInfos.map((progressInfo, index) => (
            <div className="mb-2" key={index}>
              <span>{progressInfo.fileName}</span>
              <div className="progress">
                <div
                  className="progress-bar progress-bar-info"
                  role="progressbar"
                  aria-valuenow={progressInfo.percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: progressInfo.percentage + "%" }}
                >
                  {progressInfo.percentage}%
                </div>
              </div>
            </div>
          ))}

        <div className="my-3 text-center">
          <Dropzone onDrop={this.onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  {selectedFiles &&
                  Array.isArray(selectedFiles) &&
                  selectedFiles.length ? (
                    <div className="selected-file">
                      {selectedFiles.length > 3
                        ? `${selectedFiles.length} files`
                        : selectedFiles.map((file) => file.name).join(", ")}
                    </div>
                  ) : (
                    <Alert variant="info" className="cursor-pointer">
                      Drop some files here, or click to select files
                    </Alert>
                  )}
                </div>
                <aside className="selected-file-wrapper">
                  {Array.isArray(selectedFiles) && selectedFiles.length > 0 &&
                    <Button size="sm" className="mt-4" variant="primary" disabled={!selectedFiles || this.state.uploading} onClick={this.uploadFiles}>Upload</Button>
                  } 
                </aside>
              </section>
            )}
          </Dropzone>
        </div>

        {message.length > 0 && (
          <div className="alert alert-success" role="alert">
            <ul style={{listStyle: 'none', paddingLeft: '0'}}>
              {message.map((item, i) => {
                return <li key={i}>{item}</li>;
              })}
            </ul>
          </div>
        )}

        {fileInfos.length > 0 && (
          <div className="card">
            <div className="card-header">List of Files</div>
            <ul className="list-group list-group-flush">
              {fileInfos &&
                fileInfos.map((file, index) => (
                  <li className="list-group-item" key={index}>
                    <span>{file.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}