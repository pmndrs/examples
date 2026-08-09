import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import logo from "./assets/logo.svg";
import cloudIllustration from "./assets/cloud-illustration.svg";

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

export default function Example() {
  return (
    <div className="relative overflow-hidden">
      <Popover as="header" className="relative">
        <div className="bg-gray-900 p-4 pt-6">
          <nav
            className="relative mx-auto flex max-w-7xl items-center justify-between px-6"
            aria-label="Global"
          >
            <div className="flex flex-1 items-center">
              <div className="flex w-full items-center justify-between">
                <a href="#">
                  <span className="sr-only">Workflow</span>
                  <img className="h-10 w-auto" src={logo} alt="" />
                </a>
                <div className="-mr-2 flex items-center">
                  <Popover.Button className="focus-ring-inset inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-gray-400 hover:bg-gray-800 focus:ring-2 focus:ring-white focus:outline-none">
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="hidden space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-white hover:text-gray-300"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden">
              <a
                href="#"
                className="text-base font-medium text-white hover:text-gray-300"
              >
                Log in
              </a>
              <a
                href="#"
                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white hover:bg-gray-700"
              >
                Start free trial
              </a>
            </div>
          </nav>
        </div>

        <Transition
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="absolute inset-x-0 top-0 z-10 origin-top transform p-4 transition"
          >
            <div className="ring-opacity-5 overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black">
              <div className="flex items-center justify-between px-5 pt-4">
                <div>
                  <img className="h-8 w-auto" src={logo} alt="" />
                </div>
                <div className="-mr-2">
                  <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:ring-inset">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="pt-5 pb-6">
                <div className="space-y-1 px-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="mt-6 px-5">
                  <a
                    href="#"
                    className="block w-full rounded-md bg-indigo-600 px-4 py-3 text-center font-medium text-white shadow hover:bg-indigo-700"
                  >
                    Start free trial
                  </a>
                </div>
                <div className="mt-6 px-5">
                  <p className="text-center text-base font-medium text-gray-500">
                    Existing customer?{" "}
                    <a href="#" className="text-gray-900 hover:underline">
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>

      <main>
        <div className="bg-gray-900 pt-10 pt-16">
          <div className="mx-auto max-w-7xl">
            <div className="">
              <div className="mx-auto max-w-2xl max-w-md px-4 px-6 text-center">
                <div className="">
                  <a
                    href="#"
                    className="inline-flex items-center rounded-full bg-black p-1 pr-2 text-base text-white hover:text-gray-200"
                  >
                    <span className="rounded-full bg-indigo-500 px-3 py-0.5 text-xs leading-5 font-semibold tracking-wide text-white uppercase">
                      We're hiring
                    </span>
                    <span className="ml-4 text-sm">Visit our careers page</span>
                    <ChevronRightIcon
                      className="ml-2 h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                  <h1 className="mt-4 mt-5 text-4xl text-6xl font-extrabold tracking-tight text-white">
                    <span className="block">A better way to</span>
                    <span className="block text-indigo-400">ship web apps</span>
                  </h1>
                  <p className="mt-3 mt-5 text-base text-xl text-gray-300">
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                    qui Lorem cupidatat commodo. Elit sunt amet fugiat veniam
                    occaecat fugiat.
                  </p>
                  <div className="mt-10 mt-12">
                    <form action="#" className="mx-auto max-w-xl">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <label htmlFor="email" className="sr-only">
                            Email address
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="block w-full rounded-md border-0 px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                          />
                        </div>
                        <div className="mt-0 ml-3">
                          <button
                            type="submit"
                            className="block w-full rounded-md bg-indigo-500 px-4 py-3 font-medium text-white shadow hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                          >
                            Start free trial
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 mt-4 text-sm text-gray-300">
                        Start your free 14-day trial, no credit card necessary.
                        By providing your email, you agree to our{" "}
                        <a href="#" className="font-medium text-white">
                          terms of service
                        </a>
                        .
                      </p>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-12 -mb-48">
                <div className="mx-auto max-w-2xl max-w-md px-4 px-6">
                  {/* Illustration taken from Lucid Illustrations: https://lucid.pixsellz.io/ */}
                  <img className="w-full" src={cloudIllustration} alt="" />
                </div>
              </div>
            </div>
            <div
              className="mx-auto max-w-2xl max-w-md px-4 px-6"
              style={{ height: 220 }}
            />

            <div>
              {/* Hero card */}
              <div className="relative">
                <div className="absolute inset-x-0 bottom-0 h-1/2" />
                <div className="mx-auto max-w-7xl px-6">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
                    <div className="absolute inset-0">
                      <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100"
                        alt="People working on laptops"
                      />
                      <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" />
                    </div>
                    <div className="relative px-4 px-6 py-16 py-24">
                      <h1 className="text-center text-4xl text-5xl font-extrabold tracking-tight">
                        <span className="block text-white">
                          Take control of your
                        </span>
                        <span className="block text-indigo-200">
                          customer support
                        </span>
                      </h1>
                      <p className="mx-auto mt-6 max-w-3xl max-w-lg text-center text-xl text-indigo-200">
                        Anim aute id magna aliqua ad ad non deserunt sunt. Qui
                        irure qui lorem cupidatat commodo. Elit sunt amet fugiat
                        veniam occaecat fugiat aliqua.
                      </p>
                      <div className="mx-auto mt-10 flex max-w-none max-w-sm justify-center">
                        <div className="mx-auto inline-grid grid-cols-2 gap-5 space-y-0">
                          <a
                            href="#"
                            className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 px-8 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
                          >
                            Get started
                          </a>
                          <a
                            href="#"
                            className="bg-opacity-60 hover:bg-opacity-70 flex items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 px-8 py-3 text-base font-medium text-white shadow-sm"
                          >
                            Live example
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
