import React from "react";
import Dropzone from "react-dropzone";
import axios from 'axios';
import Button from 'react-bootstrap/Button';

import { isTokenSet, getCookie } from '../utils/utils';


export class Upload2 extends React.Component {
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
    };
  }

  componentDidMount() {
    // UploadService.getFiles().then((response) => {
    //   this.setState({
    //     fileInfos: response.data,
    //   });
    // });
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
        console.log(event);
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
            "Uploaded the file successfully: " + file.name,
          ];
          return {
            message: nextMessage,
          };
        });

        return;
      });
    //   .then((files) => {
    //     this.setState({
    //       fileInfos: files.data,
    //     });
    //   })
    //   .catch(() => {
    //     _progressInfos[idx].percentage = 0;
    //     this.setState((prev) => {
    //       let nextMessage = [
    //         ...prev.message,
    //         "Could not upload the file: " + file.name,
    //       ];
    //       return {
    //         progressInfos: _progressInfos,
    //         message: nextMessage,
    //       };
    //     });
    //   });
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
                    `Drag and drop files here, or click to select files`
                  )}
                </div>
                <aside className="selected-file-wrapper">
                    <Button size="sm" className="mt-4" variant="primary" disabled={!selectedFiles} onClick={this.uploadFiles}>Upload</Button>
                </aside>
              </section>
            )}
          </Dropzone>
        </div>

        {message.length > 0 && (
          <div className="alert alert-secondary" role="alert">
            <ul>
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
                    <a href={file.url}>{file.name}</a>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}