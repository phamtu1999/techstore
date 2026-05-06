import React, { useState, useEffect, useRef } from 'react';
import { backupAPI } from '../../api/backups';
import { authAPI } from '../../api/auth';
import { 
  Cloud,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Upload,
  LockKeyhole,
  RotateCcw,
  CalendarClock,
  Database
} from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';
import AdminTable from './AdminTable';
import AdminPill from './shared/AdminPill';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);
  const formatDateTime = (value) => new Date(value).toLocaleString('vi-VN');

  // Security Verification State
  const [securityAction, setSecurityAction] = useState(null); 
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await backupAPI.getBackups();
      setBackups(response.data?.result || response.data || []);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách bản sao lưu'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setSuccess(null);
    setError(null);
    try {
      await backupAPI.createBackup();
      setSuccess('Tạo bản sao lưu thành công!');
      fetchBackups();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi khi tạo bản sao lưu. Vui lòng thử lại.'));
    } finally {
      setCreating(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSecurityAction({ type: 'upload', fileName: file.name, file: file });
    }
  };

  const handleSecurityConfirm = async (e) => {
    if (e) e.preventDefault();
    if (!verifyPassword) {
      setVerifyError('Vui lòng nhập mật khẩu xác nhận');
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    
    try {
      await authAPI.verifyPassword(verifyPassword);
      if (securityAction.type === 'download') {
        await executeDownload(securityAction.backup);
      } else if (securityAction.type === 'restore') {
        await executeRestore(securityAction.fileName);
      } else if (securityAction.type === 'delete') {
        await executeDelete(securityAction.fileName);
      } else if (securityAction.type === 'upload') {
        await executeUpload(securityAction.file);
      }
      setSecurityAction(null);
      setVerifyPassword('');
    } catch (err) {
      setVerifyError('Mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setVerifying(false);
    }
  };

  const executeDownload = async (backup) => {
    try {
      setSuccess(`Đang chuẩn bị tải bản sao lưu ${backup.fileName}...`);
      
      const response = await backupAPI.downloadFile(backup.fileName);
      
      // The response.data will be the blob from the signed URL (proxied through BFF)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Đang tải bản sao lưu ${backup.fileName}...`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Có lỗi khi tải tập tin.'));
    }
  };

  const executeRestore = async (fileName) => {
    try {
      await backupAPI.restoreBackup(fileName);
      setSuccess(`Đã khôi phục từ bản sao lưu ${fileName} thành công!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi khi khôi phục bản sao lưu.'));
    }
  };

  const executeDelete = async (fileName) => {
    try {
      await backupAPI.deleteBackup(fileName);
      setSuccess(`Đã xóa bản sao lưu ${fileName} thành công!`);
      fetchBackups();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi khi xóa bản sao lưu.'));
    }
  };

  const executeUpload = async (file) => {
    setUploading(true);
    try {
      await backupAPI.uploadBackup(file);
      setSuccess(`Đã tải lên bản sao lưu ${file.name} thành công!`);
      fetchBackups();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi khi tải lên bản sao lưu.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
              <Database className="h-7 w-7 text-admin-primary" />
              Kho lưu trữ
            </h1>
            <p className="text-[13px] font-bold text-gray-400 mt-1 uppercase tracking-widest hidden sm:block">
              Quản lý, bảo mật và khôi phục dữ liệu cửa hàng
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex bg-white dark:bg-dark-card p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <button
                  onClick={fetchBackups}
                  disabled={loading || creating || uploading}
                  title="Làm mới"
                  className="p-2 rounded-xl text-gray-400 hover:text-admin-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      await backupAPI.cleanupBackups();
                      await fetchBackups();
                      setSuccess('Đã dọn dẹp các bản backup cũ');
                    } catch (err) {
                      setError(getApiErrorMessage(err, 'Không thể dọn backup cũ'));
                    }
                  }}
                  disabled={loading || creating || uploading}
                  title="Dọn dẹp backup cũ"
                  className="p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <CalendarClock className="w-5 h-5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".sql,.gz"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || creating}
                  title="Tải lên bản sao lưu"
                  className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                </button>
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={creating || uploading}
              className="h-[46px] px-6 bg-admin-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{creating ? 'ĐANG XỬ LÝ...' : 'TẠO BACKUP'}</span>
            </button>
          </div>
        </div>

        {/* Security Verification Modal */}
        {securityAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 animate-scale-up-center">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm ${
                    securityAction.type === 'delete' 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'bg-admin-primary/10 text-admin-primary'
                  }`}>
                    {securityAction.type === 'delete' ? <Trash2 className="w-8 h-8" /> : <LockKeyhole className="w-8 h-8" />}
                  </div>
                  <h4 className="text-[20px] font-bold text-gray-900 mb-2">Xác thực quyền Admin</h4>
                  <p className="text-[13px] text-gray-500 font-medium mb-8">
                    Hành động <span className="text-gray-900 font-bold">{securityAction.type === 'upload' ? 'tải lên' : securityAction.type === 'delete' ? 'xóa' : 'khôi phục'}</span> yêu cầu xác thực bảo mật.
                  </p>
                </div>

              <form onSubmit={handleSecurityConfirm} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Mật khẩu xác nhận</label>
                  <input
                    type="password"
                    autoFocus
                    required
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    className={`block w-full h-11 px-4 bg-gray-50 border-none rounded-xl font-medium transition-all focus:ring-2 outline-none ${
                      verifyError 
                        ? 'ring-2 ring-rose-500/20' 
                        : 'focus:ring-admin-primary/20'
                    }`}
                    placeholder="Nhập mật khẩu để tiếp tục"
                  />
                  {verifyError && (
                    <p className="text-[12px] font-bold text-rose-600 ml-1 mt-1">{verifyError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityAction(null);
                      setVerifyPassword('');
                      setVerifyError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-500 font-bold text-[14px] hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className={`flex-1 h-11 rounded-xl text-white font-bold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                      securityAction.type === 'delete'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-admin-primary hover:bg-admin-primary/90'
                    }`}
                  >
                    {verifying ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Xác nhận</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content Card */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <AdminTable 
                    columns={[
                        { 
                            key: 'fileName', 
                            label: 'Tên bản sao lưu',
                            render: (val) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-gray-900 dark:text-white">
                                            {val}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Snapshot</span>
                                    </div>
                                </div>
                            )
                        },
                        { 
                            key: 'fileSize', 
                            label: 'Dung lượng',
                            render: (val) => (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-[12px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5">
                                    {val}
                                </span>
                            )
                        },
                        { 
                            key: 'createdAt', 
                            label: 'Thời gian tạo',
                            render: (val) => (
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-gray-600 dark:text-gray-400">
                                        {formatDateTime(val)}
                                    </span>
                                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Hoàn tất</span>
                                </div>
                            )
                        }
                    ]}
                    data={backups}
                    isLoading={loading}
                    onDelete={(row) => setSecurityAction({ type: 'delete', fileName: row.fileName })}
                    actions={(row) => (
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setSecurityAction({ type: 'download', backup: row })}
                                title="Tải xuống"
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setSecurityAction({ type: 'restore', fileName: row.fileName })}
                                title="Khôi phục"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    renderMobileCard={(row, index, renderActions) => (
                        <div key={row.fileName} className="p-4 border-b border-gray-50 dark:border-white/5 animate-fade-in">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-black text-gray-900 dark:text-white line-clamp-1">{row.fileName}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                {formatDateTime(row.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {renderActions(row, index)}
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dung lượng</span>
                                        <span className="text-[13px] font-black text-secondary-800 dark:text-gray-200">{row.fileSize}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</span>
                                        <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Sẵn sàng</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>

          <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                Hệ thống bảo mật Tech Store
              </p>
            </div>
            <div className="text-[11px] font-bold text-gray-400 tracking-wider">
              {backups.length} BẢN SAO LƯU HIỆN CÓ
            </div>
          </div>
        </div>
    );
};

export default BackupManagement;
