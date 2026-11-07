import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  useState,
  useEffect,
  useRef,
  Fragment,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
  Transition,
} from '@headlessui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Bars3Icon } from '@heroicons/react/24/outline';
import type { User } from 'firebase/auth';
import priceTrackSvg from './assets/pricetrack.svg';
import LoginForm from './components/Forms/LoginForm';
import SignupForm from './components/Forms/SignupForm';
import AvatarForm from './components/Forms/AvatarForm';
import EditUserForm from './components/Forms/EditUserForm';
import Modal from './components/Modal/Modal';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import {
  subscribeToAuthStateChanges,
  logout,
  updateUserAuthProfile,
} from './services/authService';
import { getUserDoc, updateUserDoc } from './services/firestoreUserService';
import { uploadUserAvatar } from './services/storageUserServce';

function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [openMobileNav, setOpenMobileNav] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] =
    useState<boolean>(false);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: userData } = useQuery({
    queryKey: ['users', user?.uid],
    queryFn: () => getUserDoc(user!.uid),
    enabled: !!user,
  });
  const avatarURL = userData?.photoURL ?? user?.photoURL;

  useEffect(() => {
    document.title = t('pageTitle.home');
  }, [t]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges(
      (currentUser: User | null) => {
        setUser(currentUser);
      }
    );
    return unsubscribe;
  }, []);

  const openLogin = (): void => {
    setIsLogin(true);
    setIsModalOpen(true);
  };
  const openSignup = (): void => {
    setIsLogin(false);
    setIsModalOpen(true);
  };
  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  // Headless UI's Menu only toggles on press, so open it on mouse hover by
  // simulating the press it listens for. Touch and keyboard keep the default.
  const openMenuOnHover = (
    e: ReactPointerEvent<HTMLDivElement>,
    open: boolean
  ): void => {
    if (e.pointerType !== 'mouse' || open) return;
    avatarButtonRef.current?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'mouse',
        button: 0,
      })
    );
  };

  const handleSignout = (): void => {
    logout().then(() => {
      setUser(null);
      navigate('/');
    });
  };

  const handleAvatarUpdate = async (file: File): Promise<void> => {
    if (!user) throw new Error('No authenticated user');

    const photoURL = await uploadUserAvatar(user.uid, file);
    await updateUserAuthProfile(user, { photoURL });
    await updateUserDoc(user.uid, { photoURL });

    await queryClient.invalidateQueries({ queryKey: ['users', user.uid] });
  };

  const handleUserUpdate = async ({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }): Promise<void> => {
    if (!user) throw new Error('No authenticated user');

    const displayName = `${firstName} ${lastName}`.trim();
    await updateUserAuthProfile(user, { displayName });
    await updateUserDoc(user.uid, { displayName, firstName, lastName });

    await queryClient.invalidateQueries({ queryKey: ['users', user.uid] });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 shadow-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/favicon.jpg"
            alt={t('header.logoAlt')}
            className="h-10 w-10 object-contain"
          />
          <span
            className={`text-xl font-bold text-gray-900 ${
              user ? '' : 'hidden md:inline'
            }`}
          >
            {t('common.appName')}
          </span>
        </Link>

        <div className="flex items-center">
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-12 text-gray-700 font-medium">
            <Link to="/how-it-works" className="hover:text-green-600">
              {t('nav.howItWorks')}
            </Link>
            <Link to="/about" className="hover:text-green-600">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="hover:text-green-600">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex gap-3 md:gap-4 md:ml-16">
            {user ? (
              <Menu as="div" className="relative">
                {({ open, close }) => (
                  <div
                    onPointerEnter={(e) => openMenuOnHover(e, open)}
                    onPointerLeave={(e) => {
                      if (e.pointerType === 'mouse' && open) close();
                    }}
                  >
                    <MenuButton
                      ref={avatarButtonRef}
                      className="flex focus:outline-hidden"
                    >
                      {avatarURL ? (
                        <img
                          src={avatarURL}
                          alt={t('header.userAvatar')}
                          className="h-10 w-10 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      )}
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 top-full z-40 pt-2 focus:outline-hidden transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
                    >
                      <div className="w-40 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
                        <MenuItem>
                          <button
                            onClick={() => setIsEditUserModalOpen(true)}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100"
                          >
                            {t('header.editUser')}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100"
                          >
                            {t('header.editAvatar')}
                          </button>
                        </MenuItem>
                        <MenuSeparator className="my-1 h-px bg-gray-200" />
                        <MenuItem>
                          <button
                            onClick={handleSignout}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100"
                          >
                            {t('header.signOut')}
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </div>
                )}
              </Menu>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="whitespace-nowrap bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 md:py-2 md:px-4 rounded-full transition transform hover:scale-105 text-sm md:text-base"
                >
                  {t('header.login')}
                </button>
                <button
                  onClick={openSignup}
                  className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 md:py-2 md:px-4 rounded-full transition transform hover:scale-105 text-sm md:text-base"
                >
                  {t('header.signUp')}
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          {!user && (
            <button
              onClick={() => setOpenMobileNav(!openMobileNav)}
              className="md:hidden ml-5 -mr-1"
            >
              <Bars3Icon className="h-7 w-7 text-gray-700" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Nav */}
      <Transition
        as={Fragment}
        show={openMobileNav}
        enter="transition-all duration-200 ease-out"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-40 opacity-100"
        leave="transition-all duration-150 ease-in"
        leaveFrom="max-h-40 opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <div className="overflow-hidden">
          <nav className="md:hidden flex flex-col gap-4 bg-white px-4 md:px-8 py-4 shadow-sm">
            <Link to="/how-it-works" onClick={() => setOpenMobileNav(false)}>
              {t('nav.howItWorks')}
            </Link>
            <Link to="/about" onClick={() => setOpenMobileNav(false)}>
              {t('nav.about')}
            </Link>
            <Link to="/contact" onClick={() => setOpenMobileNav(false)}>
              {t('nav.contact')}
            </Link>
          </nav>
        </div>
      </Transition>

      {/* Main */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={`/profile?id=${user.uid}`} replace />
              ) : (
                <div className="flex flex-col md:flex-row gap-8 px-[10%] mt-[5vh]">
                  {/* Left Column */}
                  <div className="md:w-1/2 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                      {t('home.title')}
                    </h1>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {t('home.intro')}
                      <br />
                      <br />
                      {t('home.outro')}
                    </p>
                  </div>
                  {/* Right Column */}
                  <div className="md:w-1/2 flex justify-center items-center">
                    <img
                      src={priceTrackSvg}
                      alt={t('home.imageAlt')}
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                </div>
              )
            }
          />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="shadow-md text-gray-700 py-4 text-center mt-auto">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </footer>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {isLogin ? (
          <LoginForm
            switchToSignup={() => setIsLogin(false)}
            closeModal={closeModal}
          />
        ) : (
          <SignupForm
            switchToLogin={() => setIsLogin(true)}
            closeModal={closeModal}
          />
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditUserModalOpen}
        closeModal={() => setIsEditUserModalOpen(false)}
      >
        <EditUserForm
          initialFirstName={userData?.firstName ?? ''}
          initialLastName={userData?.lastName ?? ''}
          closeModal={() => setIsEditUserModalOpen(false)}
          onSubmit={handleUserUpdate}
        />
      </Modal>

      {/* Avatar Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        closeModal={() => setIsAvatarModalOpen(false)}
      >
        <AvatarForm
          currentPhotoURL={avatarURL}
          closeModal={() => setIsAvatarModalOpen(false)}
          onSubmit={handleAvatarUpdate}
        />
      </Modal>
    </div>
  );
}

export default App;
